import { beforeEach, describe, expect, it, vi } from "vitest";

const createPasswordHashMock = vi.fn();
const setSessionCookieForUserMock = vi.fn();

const userFindFirstMock = vi.fn();
const contactUpsertMock = vi.fn();
const userCreateMock = vi.fn();
const videoAccessFindFirstMock = vi.fn();
const videoAccessCreateMock = vi.fn();
const sendAcademySignupNotificationsMock = vi.fn();
const getCurrentFeaturedLeadItemMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  createPasswordHash: createPasswordHashMock,
  setSessionCookieForUser: setSessionCookieForUserMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    user: {
      findFirst: userFindFirstMock,
      create: userCreateMock,
    },
    contact: {
      upsert: contactUpsertMock,
    },
    videoAccess: {
      findFirst: videoAccessFindFirstMock,
      create: videoAccessCreateMock,
    },
  },
}));

vi.mock("@/server/modules/education/notifications", () => ({
  sendAcademySignupNotifications: sendAcademySignupNotificationsMock,
}));

vi.mock("@/server/modules/education/featuredLeadItem", () => ({
  getCurrentFeaturedLeadItem: getCurrentFeaturedLeadItemMock,
}));

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("grants the configured free academy video and returns its academy path", async () => {
    userFindFirstMock.mockResolvedValueOnce(null);
    contactUpsertMock.mockResolvedValueOnce({
      id: "contact_1",
      email: "learner@example.com",
    });
    userCreateMock.mockResolvedValueOnce({
      id: "user_1",
      role: "LEARNER",
    });
    createPasswordHashMock.mockReturnValueOnce("hashed-password");
    getCurrentFeaturedLeadItemMock.mockResolvedValueOnce({
      kind: "VIDEO",
      id: "video_1",
      slug: "menopause-hair-loss",
      title: "Menopause & Hair Loss",
    });
    videoAccessFindFirstMock.mockResolvedValueOnce(null);

    const { POST } = await import("@/app/api/auth/signup/route");

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "learner@example.com",
          password: "verysecure",
          firstName: "Jane",
          lastName: "Smith",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(videoAccessCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contactId: "contact_1",
          videoProductId: "video_1",
          status: "ACTIVE",
        }),
      }),
    );
    expect(body).toEqual(
      expect.objectContaining({
        ok: true,
        academyPath: "/academy/videos/video_1",
      }),
    );
    expect(sendAcademySignupNotificationsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId: "contact_1",
        email: "learner@example.com",
      }),
    );
  });

  it("does not grant video access when the featured lead item is a quiz", async () => {
    userFindFirstMock.mockResolvedValueOnce(null);
    contactUpsertMock.mockResolvedValueOnce({
      id: "contact_1",
      email: "learner@example.com",
    });
    userCreateMock.mockResolvedValueOnce({
      id: "user_1",
      role: "LEARNER",
    });
    createPasswordHashMock.mockReturnValueOnce("hashed-password");
    getCurrentFeaturedLeadItemMock.mockResolvedValueOnce({
      kind: "QUIZ",
      id: "quiz_1",
      slug: "scalp-health-check",
      title: "Scalp Health Check",
    });

    const { POST } = await import("@/app/api/auth/signup/route");

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "learner@example.com",
          password: "verysecure",
          firstName: "Jane",
          lastName: "Smith",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(videoAccessCreateMock).not.toHaveBeenCalled();
    expect(body).toEqual(
      expect.objectContaining({
        ok: true,
        academyPath: "/academy",
      }),
    );
    expect(sendAcademySignupNotificationsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        videoTitle: null,
      }),
    );
  });
});
