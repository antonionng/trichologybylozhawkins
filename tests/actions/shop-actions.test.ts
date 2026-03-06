import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserOrRedirectMock = vi.fn();
const listPublishedProductsMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUserOrRedirect: requireUserOrRedirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/server/modules/shop/service", () => ({
  listPublishedProducts: listPublishedProductsMock,
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
  createShopCheckoutSession: vi.fn(),
}));

describe("shop actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests admin products with a limit compatible with service validation", async () => {
    requireUserOrRedirectMock.mockResolvedValueOnce({ user: { role: "ADMIN" } });
    listPublishedProductsMock.mockResolvedValueOnce([]);
    const { getAdminShopProducts } = await import("@/app/actions/shop");

    await getAdminShopProducts();

    expect(listPublishedProductsMock).toHaveBeenCalledWith({
      includeDrafts: true,
      limit: 100,
    });
  });
});
