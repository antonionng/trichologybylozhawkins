import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.fn();
const generateOpaqueTokenMock = vi.fn();
const hashTokenMock = vi.fn();
const sendAdminInviteEmailMock = vi.fn();

const userFindUniqueMock = vi.fn();
const userCreateMock = vi.fn();
const authTokenDeleteManyMock = vi.fn();
const authTokenCreateMock = vi.fn();
const transactionMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/server/security/tokens", () => ({
  generateOpaqueToken: generateOpaqueTokenMock,
  hashToken: hashTokenMock,
}));

vi.mock("@/server/modules/email/transactional", () => ({
  sendAdminInviteEmail: sendAdminInviteEmailMock,
}));

vi.mock("@/server/schema", () => ({
  getServerEnv: vi.fn(() => ({
    NEXT_PUBLIC_APP_URL: "https://app.example.com",
  })),
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
      create: userCreateMock,
    },
    authToken: {
      deleteMany: authTokenDeleteManyMock,
      create: authTokenCreateMock,
    },
    $transaction: transactionMock,
  },
}));

describe("POST /api/admin/invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({
      user: { id: "inviter_1", email: "owner@example.com", role: "ADMIN" },
    });
    generateOpaqueTokenMock.mockReturnValue("raw-token-abc");
    hashTokenMock.mockReturnValue("hashed-token");
    sendAdminInviteEmailMock.mockResolvedValue({ skipped: false as const, id: "email_1" });
    transactionMock.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        user: {
          create: userCreateMock,
        },
        authToken: {
          deleteMany: authTokenDeleteManyMock,
          create: authTokenCreateMock,
        },
      };
      return fn(tx);
    });
  });

  it("returns 400 when inviting your own email", async () => {
    const { POST } = await import("@/app/api/admin/invite/route");

    const res = await POST(
      new Request("http://localhost/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "owner@example.com" }),
      }),
    );

    expect(res.status).toBe(400);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("returns 409 when email is a learner", async () => {
    userFindUniqueMock.mockResolvedValueOnce({ id: "u1", role: "LEARNER" });
    const { POST } = await import("@/app/api/admin/invite/route");

    const res = await POST(
      new Request("http://localhost/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "learner@example.com" }),
      }),
    );

    expect(res.status).toBe(409);
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("creates admin, token, and sends email for new address", async () => {
    userFindUniqueMock.mockResolvedValueOnce(null);
    userCreateMock.mockResolvedValueOnce({ id: "new_admin" });
    const { POST } = await import("@/app/api/admin/invite/route");

    const res = await POST(
      new Request("http://localhost/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "new@example.com" }),
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(userCreateMock).toHaveBeenCalledWith({
      data: { email: "new@example.com", role: "ADMIN" },
    });
    expect(authTokenDeleteManyMock).toHaveBeenCalledWith({
      where: { userId: "new_admin", type: "INVITE", usedAt: null },
    });
    expect(authTokenCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "new_admin",
        type: "INVITE",
        tokenHash: "hashed-token",
      }),
    });
    expect(sendAdminInviteEmailMock).toHaveBeenCalledWith({
      to: "new@example.com",
      appUrl: "https://app.example.com",
      setPasswordUrl:
        "https://app.example.com/set-password?token=raw-token-abc&next=%2Fdashboard",
    });
  });

  it("returns 503 when email provider is not configured", async () => {
    userFindUniqueMock.mockResolvedValueOnce(null);
    userCreateMock.mockResolvedValueOnce({ id: "new_admin" });
    sendAdminInviteEmailMock.mockResolvedValueOnce({ skipped: true as const, reason: "x" });
    const { POST } = await import("@/app/api/admin/invite/route");

    const res = await POST(
      new Request("http://localhost/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "new@example.com" }),
      }),
    );

    expect(res.status).toBe(503);
  });

  it("reuses existing admin user and refreshes invite token", async () => {
    userFindUniqueMock.mockResolvedValueOnce({ id: "existing_admin", role: "ADMIN" });
    const { POST } = await import("@/app/api/admin/invite/route");

    const res = await POST(
      new Request("http://localhost/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "peer@example.com" }),
      }),
    );

    expect(res.status).toBe(200);
    expect(userCreateMock).not.toHaveBeenCalled();
    expect(authTokenDeleteManyMock).toHaveBeenCalledWith({
      where: { userId: "existing_admin", type: "INVITE", usedAt: null },
    });
    expect(sendAdminInviteEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "peer@example.com" }),
    );
  });
});
