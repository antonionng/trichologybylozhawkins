import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const contactFindUniqueMock = vi.fn();
const activityCreateMock = vi.fn();
const chatActionCreateMock = vi.fn();
const upsertContactMock = vi.fn();
const sendAdminEnquiryNotificationEmailMock = vi.fn();
const sendAndRecordEnquiryEmailsMock = vi.fn();
const getEnquiryAdminRecipientsMock = vi.fn();
const getServerEnvMock = vi.fn();

vi.mock("openai", () => ({
  default: class OpenAI {},
}));

vi.mock("@/server/schema/chat", () => ({
  sendMessageSchema: { parse: (value: unknown) => value },
  conversationQuerySchema: { parse: (value: unknown) => value },
  executeActionSchema: z.object({}),
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    contact: { findUnique: contactFindUniqueMock },
    activity: { create: activityCreateMock },
    chatAction: { create: chatActionCreateMock },
    chatConversation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    chatMessage: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    course: { findMany: vi.fn() },
  },
}));

vi.mock("@prisma/client", () => ({
  ChatRole: { USER: "USER", SYSTEM: "SYSTEM", ASSISTANT: "ASSISTANT" },
  ChatActionType: { CREATE_ENQUIRY: "CREATE_ENQUIRY" },
  ChatActionStatus: { COMPLETED: "COMPLETED", FAILED: "FAILED" },
}));

vi.mock("@/server/modules/crm/service", () => ({
  upsertContact: upsertContactMock,
}));

vi.mock("@/server/modules/email/transactional", () => ({
  sendNewChatLeadEmail: vi.fn(),
  sendAdminEnquiryNotificationEmail: sendAdminEnquiryNotificationEmailMock,
  getResendFromAddress: () => "Lorraine Hawkins <noreply@trichologyacademy.com>",
}));

vi.mock("@/server/modules/email/enquiry-delivery", () => ({
  sendAndRecordEnquiryEmails: sendAndRecordEnquiryEmailsMock,
}));

vi.mock("@/server/modules/settings/notifications", () => ({
  getOperationalAdminRecipients: vi.fn(),
  getEnquiryAdminRecipients: getEnquiryAdminRecipientsMock,
}));

vi.mock("@/server/schema/env", () => ({
  getServerEnv: getServerEnvMock,
}));

vi.mock("@/lib/chatPrompts", () => ({
  buildSystemPrompt: () => "System prompt",
}));

describe("chat submit_course_enquiry admin notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contactFindUniqueMock.mockResolvedValue({
      id: "contact_9",
      email: "jane@example.com",
    });
    activityCreateMock.mockResolvedValue({});
    chatActionCreateMock.mockResolvedValue({});
    getEnquiryAdminRecipientsMock.mockResolvedValue([
      "loz.hawkins95@gmail.com",
      "ag@experrt.com",
    ]);
    getServerEnvMock.mockReturnValue({
      NEXT_PUBLIC_APP_URL: "https://trichologyacademy.co.uk",
    });
    sendAdminEnquiryNotificationEmailMock.mockResolvedValue({
      skipped: false,
      id: "msg_admin",
    });
    sendAndRecordEnquiryEmailsMock.mockImplementation(async ({ jobs }) => {
      await Promise.all(jobs.map((job: { run: () => Promise<unknown> }) => job.run()));
      return { status: "sent", error: null, results: [] };
    });
  });

  it("sends the same admin enquiry notification as the public enquiry form", async () => {
    const { executeFunction } = await import("@/server/modules/chat/service");

    await executeFunction("conv_1", "submit_course_enquiry", {
      courseName: "Trichology in Clinical Practice",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "01234 567890",
      message: "Can my team join the next intake?",
    });

    expect(getEnquiryAdminRecipientsMock).toHaveBeenCalledTimes(1);
    expect(sendAdminEnquiryNotificationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["loz.hawkins95@gmail.com", "ag@experrt.com"],
        contactId: "contact_9",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        enquiryType: "education",
        message: expect.stringContaining("Trichology in Clinical Practice"),
      }),
    );
    expect(sendAndRecordEnquiryEmailsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId: "contact_9",
      }),
    );
  });
});
