import { beforeEach, describe, expect, it, vi } from "vitest";

const createShopCheckoutSessionMock = vi.fn();
const redirectMock = vi.fn();
const getCurrentSessionMock = vi.fn();
const userFindUniqueMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/security/auth", () => ({
  requireUserOrRedirect: vi.fn(),
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
  },
}));

vi.mock("@/server/modules/shop/service", () => ({
  listPublishedProducts: vi.fn(),
  getProductBySlug: vi.fn(),
  listCategories: vi.fn(),
  listAllCategories: vi.fn(),
  getShopDashboardStats: vi.fn(),
  listOrders: vi.fn(),
  getOrder: vi.fn(),
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  updateOrderStatus: vi.fn(),
  createShopCheckoutSession: createShopCheckoutSessionMock,
}));

describe("startShopCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hydrates checkout customer fields from logged-in user contact", async () => {
    getCurrentSessionMock.mockResolvedValueOnce({ uid: "u1", role: "LEARNER", exp: 9999999999 });
    userFindUniqueMock.mockResolvedValueOnce({
      id: "u1",
      email: "member@example.com",
      contactId: "c1",
      contact: {
        id: "c1",
        email: "member@example.com",
        firstName: "Member",
        lastName: "Name",
        phone: "07123456789",
      },
    });
    createShopCheckoutSessionMock.mockResolvedValueOnce({ id: "sess_1", url: "https://stripe.test/session/1" });
    const { startShopCheckout } = await import("@/app/actions/shop");

    await startShopCheckout({
      items: [{ productId: "ck1234567890123456789012", quantity: 1 }],
      successUrl: "https://example.com/shop/success",
      cancelUrl: "https://example.com/shop/cart",
    });

    expect(createShopCheckoutSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId: "c1",
        customer: expect.objectContaining({
          email: "member@example.com",
          firstName: "Member",
          lastName: "Name",
        }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("https://stripe.test/session/1");
  });
});
