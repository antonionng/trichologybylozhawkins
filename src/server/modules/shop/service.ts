import { prisma } from "@/server/db/client";
import {
  getServerEnv,
  shopCategorySchema,
  shopCheckoutSchema,
  shopOrderStatusSchema,
  shopProductSchema,
} from "@/server/schema";
import { PaymentProvider, ShopOrderEventType, ShopOrderStatus, ShopProductStatus } from "@prisma/client";
import Stripe from "stripe";
import { z } from "zod";

const categoryMutationSchema = shopCategorySchema.extend({
  id: z.string().cuid().optional(),
});

const productMutationSchema = shopProductSchema.extend({
  id: z.string().cuid().optional(),
});

const listProductsSchema = z.object({
  categorySlug: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().positive().max(100).default(24),
  offset: z.number().int().min(0).default(0),
  includeDrafts: z.boolean().default(false),
});

const listOrdersSchema = z.object({
  status: z.nativeEnum(ShopOrderStatus).optional(),
  query: z.string().optional(),
  limit: z.number().int().positive().max(100).default(30),
  offset: z.number().int().min(0).default(0),
});

const stripeClient = () => {
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
};

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function ensureContact(customer: { email: string; firstName: string; lastName: string; phone?: string }) {
  const existing = await prisma.contact.findUnique({
    where: { email: customer.email },
  });
  if (existing) return existing;
  return prisma.contact.create({
    data: {
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      source: "shop",
    },
  });
}

export async function listCategories() {
  return prisma.shopCategory.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
}

export async function listAllCategories() {
  return prisma.shopCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });
}

export async function createCategory(input: z.infer<typeof categoryMutationSchema>) {
  const data = categoryMutationSchema.parse(input);
  const { id, ...payload } = data;
  if (id) {
    return prisma.shopCategory.update({ where: { id }, data: payload });
  }
  return prisma.shopCategory.create({ data: payload });
}

export async function deleteCategory(id: string) {
  return prisma.shopCategory.delete({ where: { id } });
}

export async function listPublishedProducts(input: Partial<z.infer<typeof listProductsSchema>> = {}) {
  const data = listProductsSchema.parse(input);
  const where = {
    ...(data.includeDrafts ? {} : { status: ShopProductStatus.PUBLISHED }),
    ...(data.categorySlug ? { category: { slug: data.categorySlug } } : {}),
    ...(data.query
      ? {
          OR: [
            { name: { contains: data.query, mode: "insensitive" as const } },
            { description: { contains: data.query, mode: "insensitive" as const } },
            { shortDescription: { contains: data.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  return prisma.shopProduct.findMany({
    where,
    include: {
      category: true,
      heroMedia: true,
      images: {
        include: { media: true },
        orderBy: { position: "asc" },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: data.limit,
    skip: data.offset,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.shopProduct.findUnique({
    where: { slug },
    include: {
      category: true,
      heroMedia: true,
      images: { include: { media: true }, orderBy: { position: "asc" } },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.shopProduct.findUnique({
    where: { id },
    include: {
      category: true,
      heroMedia: true,
      images: { include: { media: true }, orderBy: { position: "asc" } },
    },
  });
}

export async function createProduct(input: z.infer<typeof productMutationSchema>) {
  const data = productMutationSchema.parse(input);
  const { id, imageMediaIds, ...payload } = data;

  if (id) {
    const product = await prisma.shopProduct.update({
      where: { id },
      data: payload,
    });

    await prisma.shopProductImage.deleteMany({ where: { productId: id } });
    if (imageMediaIds.length > 0) {
      await prisma.shopProductImage.createMany({
        data: imageMediaIds.map((mediaId, index) => ({
          productId: id,
          mediaId,
          position: index,
        })),
      });
    }
    return product;
  }

  return prisma.shopProduct.create({
    data: {
      ...payload,
      images: {
        create: imageMediaIds.map((mediaId, index) => ({
          mediaId,
          position: index,
        })),
      },
    },
  });
}

export async function deleteProduct(id: string) {
  return prisma.shopProduct.delete({ where: { id } });
}

export async function createShopCheckoutSession(input: z.infer<typeof shopCheckoutSchema>) {
  const data = shopCheckoutSchema.parse(input);
  const products = await prisma.shopProduct.findMany({
    where: { id: { in: data.items.map((item) => item.productId) }, status: ShopProductStatus.PUBLISHED },
  });

  if (products.length !== data.items.length) {
    throw new Error("Some products are unavailable.");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const lineItems = data.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error("Product not found.");
    if (product.trackInventory && product.stockQuantity < item.quantity) {
      throw new Error(`${product.name} does not have enough stock.`);
    }
    return {
      product,
      quantity: item.quantity,
      subtotal: Number(product.price) * item.quantity,
    };
  });

  const subtotalAmount = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingAmount = 0;
  const totalAmount = subtotalAmount + shippingAmount;
  const shippingAddress = data.shippingAddress ?? {};
  const billingAddress = data.billingAddress ?? data.shippingAddress ?? {};
  const contact = data.contactId
    ? await prisma.contact.findUnique({ where: { id: data.contactId } })
    : await ensureContact(data.customer);

  if (!contact) {
    throw new Error("Unable to resolve contact for checkout.");
  }

  if (process.env.DEV_SKIP_CHECKOUT === "true" || data.paymentProvider !== PaymentProvider.STRIPE) {
    const order = await prisma.shopOrder.create({
      data: {
        contactId: contact.id,
        email: data.customer.email,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        phone: data.customer.phone,
        shippingAddress,
        billingAddress,
        subtotalAmount,
        shippingAmount,
        totalAmount,
        currency: "GBP",
        status: ShopOrderStatus.CONFIRMED,
        paymentProvider: data.paymentProvider,
        metadata: data.metadata,
        items: {
          create: lineItems.map(({ product, quantity }) => ({
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            currency: product.currency,
          })),
        },
        events: {
          create: {
            type: ShopOrderEventType.STATUS_CHANGE,
            description: "Order confirmed (dev/manual checkout).",
          },
        },
      },
    });

    return { id: order.id, url: `${getBaseUrl()}/shop/success?order=${order.id}` };
  }

  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    customer_email: data.customer.email,
    phone_number_collection: { enabled: true },
    shipping_address_collection: {
      allowed_countries: ["GB", "IE", "US", "CA", "AU", "NZ", "FR", "DE", "ES", "IT"],
    },
    line_items: lineItems.map(({ product, quantity }) => ({
      quantity,
      price_data: {
        currency: product.currency.toLowerCase(),
        unit_amount: Math.round(Number(product.price) * 100),
        product_data: {
          name: product.name,
          description: product.shortDescription || product.description || undefined,
          metadata: { productId: product.id },
        },
      },
    })),
    metadata: {
      orderScope: "SHOP",
      customerFirstName: data.customer.firstName,
      customerLastName: data.customer.lastName,
      customerPhone: data.customer.phone ?? "",
      shippingAddress: JSON.stringify(shippingAddress),
      billingAddress: JSON.stringify(billingAddress),
      ...data.metadata,
    },
  });

  await prisma.shopOrder.create({
    data: {
      contactId: contact.id,
      email: data.customer.email,
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      phone: data.customer.phone,
      shippingAddress,
      billingAddress,
      subtotalAmount,
      shippingAmount,
      totalAmount,
      currency: "GBP",
      status: ShopOrderStatus.PENDING,
      paymentProvider: PaymentProvider.STRIPE,
      providerSessionId: session.id,
      metadata: data.metadata,
      items: {
        create: lineItems.map(({ product, quantity }) => ({
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          currency: product.currency,
        })),
      },
    },
  });

  return session;
}

export async function handleShopCheckoutFulfillment(options: {
  providerSessionId: string;
  paymentIntentId?: string | null;
  status: "succeeded" | "failed";
  payload?: Record<string, unknown>;
}) {
  const order = await prisma.shopOrder.findFirst({
    where: { providerSessionId: options.providerSessionId },
    include: { items: true },
  });
  if (!order) {
    throw new Error("Shop order not found during fulfillment.");
  }

  const nextStatus =
    options.status === "succeeded" ? ShopOrderStatus.CONFIRMED : ShopOrderStatus.CANCELLED;

  if (order.status === nextStatus) return;

  await prisma.$transaction(async (tx) => {
    await tx.shopOrder.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        providerPaymentIntentId: options.paymentIntentId ?? undefined,
      },
    });

    await tx.shopOrderEvent.create({
      data: {
        orderId: order.id,
        type: ShopOrderEventType.STATUS_CHANGE,
        description:
          options.status === "succeeded"
            ? "Payment completed and order confirmed."
            : "Checkout expired or payment failed.",
        payload: options.payload ?? {},
      },
    });

    if (options.status === "succeeded") {
      for (const item of order.items) {
        if (!item.productId) continue;
        const product = await tx.shopProduct.findUnique({ where: { id: item.productId } });
        if (!product || !product.trackInventory) continue;
        await tx.shopProduct.update({
          where: { id: item.productId },
          data: {
            stockQuantity: Math.max(0, product.stockQuantity - item.quantity),
            status:
              product.stockQuantity - item.quantity <= 0
                ? ShopProductStatus.OUT_OF_STOCK
                : product.status,
          },
        });
      }
    }
  });
}

export async function listOrders(input: Partial<z.infer<typeof listOrdersSchema>> = {}) {
  const data = listOrdersSchema.parse(input);
  return prisma.shopOrder.findMany({
    where: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.query
        ? {
            OR: [
              { email: { contains: data.query, mode: "insensitive" } },
              { firstName: { contains: data.query, mode: "insensitive" } },
              { lastName: { contains: data.query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      items: true,
      contact: true,
    },
    orderBy: { createdAt: "desc" },
    take: data.limit,
    skip: data.offset,
  });
}

export async function getOrder(id: string) {
  return prisma.shopOrder.findUnique({
    where: { id },
    include: {
      contact: true,
      items: { include: { product: true } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateOrderStatus(id: string, input: z.infer<typeof shopOrderStatusSchema>) {
  const data = shopOrderStatusSchema.parse(input);
  const updated = await prisma.shopOrder.update({
    where: { id },
    data: {
      status: data.status,
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
      notes: data.note,
    },
  });

  await prisma.shopOrderEvent.create({
    data: {
      orderId: id,
      type: data.trackingNumber || data.trackingUrl ? ShopOrderEventType.TRACKING_UPDATED : ShopOrderEventType.STATUS_CHANGE,
      description: data.note || `Order updated to ${data.status}.`,
      payload: {
        status: data.status,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
      },
    },
  });

  return updated;
}

export async function getShopDashboardStats() {
  const [totalProducts, publishedProducts, totalOrders, paidLikeOrders, recentOrders] = await Promise.all([
    prisma.shopProduct.count(),
    prisma.shopProduct.count({ where: { status: ShopProductStatus.PUBLISHED } }),
    prisma.shopOrder.count(),
    prisma.shopOrder.aggregate({
      where: { status: { in: [ShopOrderStatus.CONFIRMED, ShopOrderStatus.PROCESSING, ShopOrderStatus.SHIPPED, ShopOrderStatus.DELIVERED] } },
      _sum: { totalAmount: true },
    }),
    prisma.shopOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
  ]);

  return {
    totals: {
      products: totalProducts,
      productsPublished: publishedProducts,
      orders: totalOrders,
      revenue: Number(paidLikeOrders._sum.totalAmount ?? 0),
    },
    recentOrders,
  };
}

