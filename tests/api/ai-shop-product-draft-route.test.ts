import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.fn();
const createResponseMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    responses: {
      create: createResponseMock,
    },
  })),
}));

describe("POST /api/ai/shop-product-draft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a generated product draft payload", async () => {
    requireUserMock.mockResolvedValueOnce({ user: { role: "ADMIN" } });
    createResponseMock.mockResolvedValueOnce({
      output: [
        {
          type: "output_text",
          text: JSON.stringify({
            name: "Hydration Boost Conditioner",
            slug: "hydration-boost-conditioner",
            shortDescription: "Nourishing conditioner for dry, stressed hair.",
            description: "A rich formula designed to soften and protect.",
            perfectFor: "Dry and damaged hair",
            ingredients: "Aloe vera, shea butter, panthenol",
            keyIngredients: ["Aloe vera", "Shea butter", "Panthenol"],
            priceSuggestion: 24,
          }),
        },
      ],
    });

    const { POST } = await import("@/app/api/ai/shop-product-draft/route");
    const response = await POST(
      new Request("http://localhost/api/ai/shop-product-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Hydrating conditioner for dry scalp and frizz." }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(requireUserMock).toHaveBeenCalledWith({ role: "ADMIN" });
    expect(body).toEqual(
      expect.objectContaining({
        draft: expect.objectContaining({
          name: "Hydration Boost Conditioner",
          slug: "hydration-boost-conditioner",
          priceSuggestion: 24,
        }),
      }),
    );
  });
});
