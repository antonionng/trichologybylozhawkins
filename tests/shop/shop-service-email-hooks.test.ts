import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentProvider, ShopOrderStatus } from "@prisma/client";
import { z } from "zod";

const sendShopOrderLifecycleEmailsMock = vi.fn();
const orderFindFirstMock = vi.fn();
const orderFindUniqueMock = vi.fn();
const orderUpdateMock = vi.fn();
const orderEventCreateMock = vi.fn();
const productFindUniqueMock = vi.fn();
const productUpdateMock = vi.fn();

vi.mock("@/server/schema", () => ({
  getServerEnv: vi.fn(),
  shopCategorySchema: z.object({ name: z.string() }),
  shopCheckoutSchema: z.object({}),
  shopOrderStatusSchema: z.object({
    status: z.nativeEnum(ShopOrderStatus),
    trackingNumber: z.string().optional(),
    trackingUrl: z.string().optional(),
    note: z.string().optional(),
  }),
  shopProductSchema: z.object({ name: z.string() }),
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    shopOrder: {
      findFirst: orderFindFirstMock,
      findUnique: orderFindUniqueMock,
      update: orderUpdateMock,
    },
    shopOrderEvent: {
      create: orderEventCreateMock,
    },
    shopProduct: {
      findUnique: productFindUniqueMock,
      update: productUpdateMock,
    },
    $transaction: async (callback: (tx: any) => Promise<void>) =>
      callback({
        shopOrder: { update: orderUpdateMock },
        shopOrderEvent: { create: orderEventCreateMock },
        shopProduct: { findUnique: productFindUniqueMock, update: productUpdateMock },
      }),
  },
}));

vi.mock("@/server/modules/shop/notifications", () => ({
  sendShopOrderLifecycleEmails: sendShopOrderLifecycleEmailsMock,
}));

describe("shop service email hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productFindUniqueMock.mockResolvedValue(null);
  });

  it("triggers order lifecycle emails after successful checkout fulfillment", async () => {
    orderFindFirstMock.mockResolvedValue({
      id: "ord_1",
      email: "customer@example.com",
      firstName: "Jane",
      lastName: "Doe",
      status: ShopOrderStatus.PENDING,
      subtotalAmount: 18,
      shippingAmount: 0,
      totalAmount: 18,
      currency: "GBP",
      paymentProvider: PaymentProvider.STRIPE,
      trackingNumber: null,
      trackingUrl: null,
      items: [],
    });

    const { handleShopCheckoutFulfillment } = await import("@/server/modules/shop/service");

    await handleShopCheckoutFulfillment({
      providerSessionId: "sess_1",
      status: "succeeded",
    });

    expect(sendShopOrderLifecycleEmailsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        previousStatus: ShopOrderStatus.PENDING,
        order: expect.objectContaining({
          id: "ord_1",
          status: ShopOrderStatus.CONFIRMED,
        }),
      }),
    );
  });

  it("triggers lifecycle emails after an admin status update", async () => {
    orderFindUniqueMock.mockResolvedValue({
      id: "ord_2",
      email: "customer@example.com",
      firstName: "Jane",
      lastName: "Doe",
      status: ShopOrderStatus.PROCESSING,
      subtotalAmount: 18,
      shippingAmount: 0,
      totalAmount: 18,
      currency: "GBP",
      trackingNumber: null,
      trackingUrl: null,
      items: [],
    });
    orderUpdateMock.mockResolvedValue({
      id: "ord_2",
      status: ShopOrderStatus.SHIPPED,
      trackingNumber: "TRACK123",
      trackingUrl: "https://track.example.com/TRACK123",
      note: undefined,
    });

    const { updateOrderStatus } = await import("@/server/modules/shop/service");

    await updateOrderStatus("ord_2", {
      status: ShopOrderStatus.SHIPPED,
      trackingNumber: "TRACK123",
      trackingUrl: "https://track.example.com/TRACK123",
    });

    expect(sendShopOrderLifecycleEmailsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        previousStatus: ShopOrderStatus.PROCESSING,
        previousTrackingUrl: null,
        order: expect.objectContaining({
          id: "ord_2",
          status: ShopOrderStatus.SHIPPED,
          trackingUrl: "https://track.example.com/TRACK123",
        }),
      }),
    );
  });
});
