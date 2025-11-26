import { ChatActionType, ChatRole, ChatStatus } from "@prisma/client";
import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.nativeEnum(ChatRole),
  content: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid().optional().nullable(),
  sessionId: z.string().optional().nullable(),
  message: z.string().min(1).max(4000),
  contactId: z.string().cuid().optional().nullable(),
  metadata: z.record(z.any()).optional(),
});

export const conversationQuerySchema = z.object({
  sessionId: z.string().optional(),
  contactId: z.string().cuid().optional(),
  limit: z.number().int().positive().default(10),
});

export const executeActionSchema = z.object({
  conversationId: z.string().cuid(),
  actionType: z.nativeEnum(ChatActionType),
  payload: z.record(z.any()),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ConversationQueryInput = z.infer<typeof conversationQuerySchema>;
export type ExecuteActionInput = z.infer<typeof executeActionSchema>;






