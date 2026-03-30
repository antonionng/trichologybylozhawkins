import { beforeEach, describe, expect, it, vi } from "vitest";

const retrieveSessionMock = vi.fn();
const handleCheckoutFulfillmentMock = vi.fn();
const getCurrentSessionMock = vi.fn();
const generateOpaqueTokenMock = vi.fn();
const hashTokenMock = vi.fn();

const orderFindFirstMock = vi.fn();
const userFindUniqueMock = vi.fn();
const userCreateMock = vi.fn();
const userUpdateMock = vi.fn();
const authTokenCreateMock = vi.fn();

vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          retrieve: retrieveSessionMock,
        },
      },
    })),
  };
});

vi.mock("@/server/schema", () => ({
  getServerEnv: vi.fn(() => ({
    STRIPE_SECRET_KEY: "sk_test_123",
  })),
}));

vi.mock("@/server/modules/education/service", () => ({
  handleCheckoutFulfillment: handleCheckoutFulfillmentMock,
}));

vi.mock("@/server/security/tokens", () => ({
  generateOpaqueToken: generateOpaqueTokenMock,
  hashToken: hashTokenMock,
}));

vi.mock("@/server/security/auth", () => ({
  getCurrentSession: getCurrentSessionMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    order: {
      findFirst: orderFindFirstMock,
    },
    user: {
      findUnique: userFindUniqueMock,
      create: userCreateMock,
      update: userUpdateMock,
    },
    authToken: {
      create: authTokenCreateMock,
    },
  },
}));

describe("POST /api/education/claim", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links the authenticated learner to the fulfilled order contact before returning already-authenticated", async () => {
    retrieveSessionMock.mockResolvedValueOnce({
      id: "cs_test_123",
      payment_status: "paid",
      payment_intent: "pi_123",
    });
    handleCheckoutFulfillmentMock.mockResolvedValueOnce(undefined);
    orderFindFirstMock.mockResolvedValueOnce({
      id: "order_1",
      contactId: "contact_1",
      contact: { email: "learner@example.com" },
    });
    getCurrentSessionMock.mockResolvedValueOnce({
      uid: "user_1",
      role: "LEARNER",
      exp: 9999999999,
    });
    userFindUniqueMock.mockResolvedValueOnce({
      id: "user_1",
      email: "learner@example.com",
      contactId: null,
      passwordHash: "hashed",
    });

    const { POST } = await import("@/app/api/education/claim/route");

    const response = await POST(
      new Request("http://localhost/api/education/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: "cs_test_123" }),
      }),
    );
    const body = await response.json();

    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { contactId: "contact_1" },
    });
    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, mode: "already-authenticated" });
  });
});
