import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const chatConversationFindFirstMock = vi.fn();
const chatConversationCreateMock = vi.fn();
const chatConversationUpdateMock = vi.fn();
const chatMessageCountMock = vi.fn();
const chatMessageCreateMock = vi.fn();
const chatMessageFindManyMock = vi.fn();
const activityCreateMock = vi.fn();
const upsertContactMock = vi.fn();
const sendNewChatLeadEmailMock = vi.fn();
const getOperationalAdminRecipientsMock = vi.fn();
const getServerEnvMock = vi.fn();

vi.mock("openai", () => ({
  default: class OpenAI {},
}));

vi.mock("@/server/schema/chat", () => ({
  sendMessageSchema: {
    parse: (value: unknown) => value,
  },
  conversationQuerySchema: {
    parse: (value: unknown) => value,
  },
  executeActionSchema: z.object({}),
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    chatConversation: {
      findFirst: chatConversationFindFirstMock,
      create: chatConversationCreateMock,
      update: chatConversationUpdateMock,
    },
    chatMessage: {
      count: chatMessageCountMock,
      create: chatMessageCreateMock,
      findMany: chatMessageFindManyMock,
    },
    activity: {
      create: activityCreateMock,
    },
    contact: {
      findUnique: vi.fn(),
    },
    chatAction: {
      create: vi.fn(),
    },
    course: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@prisma/client", () => ({
  ChatRole: {
    USER: "USER",
    SYSTEM: "SYSTEM",
    ASSISTANT: "ASSISTANT",
  },
  ChatActionType: {},
  ChatActionStatus: {},
}));

vi.mock("@/server/modules/crm/service", () => ({
  upsertContact: upsertContactMock,
}));

vi.mock("@/server/modules/email/transactional", () => ({
  sendNewChatLeadEmail: sendNewChatLeadEmailMock,
}));

vi.mock("@/server/modules/settings/notifications", () => ({
  getOperationalAdminRecipients: getOperationalAdminRecipientsMock,
}));

vi.mock("@/server/schema/env", () => ({
  getServerEnv: getServerEnvMock,
}));

vi.mock("@/lib/chatPrompts", () => ({
  buildSystemPrompt: () => "System prompt",
}));

describe("chat service admin email routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chatConversationFindFirstMock.mockResolvedValueOnce(null);
    chatConversationCreateMock.mockResolvedValueOnce({
      id: "conv_1",
      contactId: null,
      messages: [],
    });
    chatMessageCountMock.mockResolvedValueOnce(0);
    upsertContactMock.mockResolvedValueOnce({ id: "contact_1" });
    chatMessageFindManyMock.mockResolvedValueOnce([
      { role: "USER", content: "I need help with training options" },
      { role: "ASSISTANT", content: "I can help with that." },
    ]);
    getOperationalAdminRecipientsMock.mockResolvedValueOnce([
      "ops@example.com",
      "team@example.com",
    ]);
    getServerEnvMock.mockReturnValue({
      NEXT_PUBLIC_APP_URL: "https://example.com",
    });
    sendNewChatLeadEmailMock.mockResolvedValue({ skipped: false, id: "msg_1" });
  });

  it("sends the first chat lead email to the shared admin recipient list", async () => {
    const { sendMessage } = await import("@/server/modules/chat/service");

    await sendMessage({
      sessionId: "session_1",
      contactId: null,
      conversationId: null,
      message: "I need help with training options",
      metadata: null,
    });

    expect(getOperationalAdminRecipientsMock).toHaveBeenCalledTimes(1);
    expect(sendNewChatLeadEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["ops@example.com", "team@example.com"],
        conversationId: "conv_1",
        contactId: "contact_1",
      }),
    );
  });
});
