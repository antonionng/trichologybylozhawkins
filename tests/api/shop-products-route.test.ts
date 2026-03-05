import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.fn();
const listPublishedProductsMock = vi.fn();
const createProductMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/server/modules/shop/service", () => ({
  listPublishedProducts: listPublishedProductsMock,
  createProduct: createProductMock,
}));

describe("GET /api/shop/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns products from the shop service", async () => {
    listPublishedProductsMock.mockResolvedValueOnce([{ id: "p1", name: "Product 1" }]);
    const { GET } = await import("@/app/api/shop/products/route");

    const response = await GET(
      new Request("http://localhost/api/shop/products?category=shampoo&q=revitalize"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([{ id: "p1", name: "Product 1" }]);
    expect(listPublishedProductsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        categorySlug: "shampoo",
        query: "revitalize",
      }),
    );
  });
});

describe("POST /api/shop/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires admin and creates a product", async () => {
    requireUserMock.mockResolvedValueOnce({ user: { role: "ADMIN" } });
    createProductMock.mockResolvedValueOnce({ id: "p2", slug: "new-product" });
    const { POST } = await import("@/app/api/shop/products/route");

    const response = await POST(
      new Request("http://localhost/api/shop/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Product", slug: "new-product", price: 20 }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(requireUserMock).toHaveBeenCalledWith({ role: "ADMIN" });
    expect(createProductMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "New Product", slug: "new-product" }),
    );
    expect(body).toEqual({ id: "p2", slug: "new-product" });
  });
});

