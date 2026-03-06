import { PaymentProvider, ShopOrderStatus, ShopProductStatus } from "@prisma/client";
import { z } from "zod";

export const shopCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must use lowercase, numbers, and hyphens."),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "HIDDEN"]).default("ACTIVE"),
});

export const shopProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must use lowercase, numbers, and hyphens."),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().cuid().optional().nullable(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  currency: z.string().length(3).default("GBP"),
  sku: z.string().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  trackInventory: z.boolean().default(true),
  status: z.nativeEnum(ShopProductStatus).default(ShopProductStatus.DRAFT),
  weightGrams: z.number().int().min(0).optional().nullable(),
  ingredients: z.string().optional(),
  perfectFor: z.string().optional(),
  keyIngredients: z.array(z.string()).default([]),
  heroMediaId: z.string().cuid().optional().nullable(),
  meta: z.record(z.any()).optional(),
  imageMediaIds: z.array(z.string().cuid()).optional().default([]),
});

export const shopOrderAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(2),
});

export const shopCheckoutItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().default(1),
});

export const shopCheckoutSchema = z
  .object({
    items: z.array(shopCheckoutItemSchema).min(1),
    customer: z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional(),
    }),
    shippingAddress: shopOrderAddressSchema.optional(),
    billingAddress: shopOrderAddressSchema.optional(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    contactId: z.string().cuid().optional(),
    paymentProvider: z.nativeEnum(PaymentProvider).default(PaymentProvider.STRIPE),
    metadata: z.record(z.string()).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.paymentProvider !== PaymentProvider.STRIPE && !value.shippingAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shippingAddress"],
        message: "Shipping address is required for non-Stripe checkout providers.",
      });
    }
  });

export const shopOrderStatusSchema = z.object({
  status: z.nativeEnum(ShopOrderStatus),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  note: z.string().optional(),
});

