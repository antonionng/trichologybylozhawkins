import { prisma } from "@/server/db/client";
import {
  sendMessageSchema,
  conversationQuerySchema,
  executeActionSchema,
} from "@/server/schema/chat";
import { ChatRole, ChatActionType, ChatActionStatus } from "@prisma/client";
import OpenAI from "openai";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/chatPrompts";
import { upsertContact } from "@/server/modules/crm/service";
import { prisma as db } from "@/server/db/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function definitions for OpenAI function calling
const FUNCTION_DEFINITIONS = [
  {
    name: "create_contact",
    description:
      "Create or update a contact in the CRM system. Use this when the user provides their contact details and consents to being contacted.",
    parameters: {
      type: "object",
      properties: {
        firstName: {
          type: "string",
          description: "First name of the contact",
        },
        lastName: {
          type: "string",
          description: "Last name of the contact",
        },
        email: {
          type: "string",
          description: "Email address",
        },
        phone: {
          type: "string",
          description: "Phone number (optional)",
        },
        notes: {
          type: "string",
          description: "Any relevant notes from the conversation",
        },
      },
      required: ["firstName", "lastName", "email"],
    },
  },
  {
    name: "submit_course_enquiry",
    description:
      "Submit an enquiry about a specific course or training program. Use when the user wants more information or to enroll.",
    parameters: {
      type: "object",
      properties: {
        courseName: {
          type: "string",
          description: "Name of the course they're interested in",
        },
        name: {
          type: "string",
          description: "Full name",
        },
        email: {
          type: "string",
          description: "Email address",
        },
        phone: {
          type: "string",
          description: "Phone number (optional)",
        },
        message: {
          type: "string",
          description: "Their question or message about the course",
        },
      },
      required: ["courseName", "name", "email", "message"],
    },
  },
  {
    name: "book_consultation",
    description:
      "Create a consultation booking request. Use when user wants to book a scalp health consultation with Lorraine.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Full name",
        },
        email: {
          type: "string",
          description: "Email address",
        },
        phone: {
          type: "string",
          description: "Phone number",
        },
        concern: {
          type: "string",
          description: "Brief description of their scalp/hair concern",
        },
        preferredTime: {
          type: "string",
          description: "Their preferred time/date if mentioned (optional)",
        },
      },
      required: ["name", "email", "phone", "concern"],
    },
  },
  {
    name: "get_available_courses",
    description:
      "Fetch detailed information about available courses and training programs from the database.",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Filter by category (optional)",
          enum: ["video", "intensive", "all"],
        },
      },
    },
  },
];

export async function getOrCreateConversation(
  sessionId?: string,
  contactId?: string,
  conversationId?: string
) {
  if (conversationId) {
    const existing = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50, // Last 50 messages for context
        },
      },
    });
    if (existing) return existing;
  }

  // Try to find existing by session
  if (sessionId) {
    const existing = await prisma.chatConversation.findFirst({
      where: { sessionId, status: "ACTIVE" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) return existing;
  }

  // Create new conversation
  return prisma.chatConversation.create({
    data: {
      sessionId,
      contactId,
      title: "New conversation",
    },
    include: {
      messages: true,
    },
  });
}

export async function sendMessage(input: z.infer<typeof sendMessageSchema>) {
  const data = sendMessageSchema.parse(input);

  // Get or create conversation (convert null to undefined)
  const conversation = await getOrCreateConversation(
    data.sessionId || undefined,
    data.contactId || undefined,
    data.conversationId || undefined
  );

  // Save user message
  await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      role: ChatRole.USER,
      content: data.message,
      metadata: data.metadata,
    },
  });

  // Build message history for OpenAI
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildSystemPrompt(),
    },
    ...conversation.messages.map((msg) => ({
      role: msg.role.toLowerCase() as "user" | "assistant" | "system",
      content: msg.content,
    })),
    {
      role: "user",
      content: data.message,
    },
  ];

  return {
    conversationId: conversation.id,
    messages,
  };
}

export async function streamChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  conversationId: string
) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    functions: FUNCTION_DEFINITIONS as any,
    function_call: "auto",
    temperature: 0.7,
    stream: true,
  });

  return {
    stream,
    conversationId,
  };
}

export async function saveAssistantMessage(
  conversationId: string,
  content: string,
  functionCall?: any
) {
  const metadata = functionCall ? { functionCall } : undefined;

  const message = await prisma.chatMessage.create({
    data: {
      conversationId,
      role: ChatRole.ASSISTANT,
      content,
      metadata: metadata as any,
    },
  });

  // Update conversation title if it's the first exchange
  const messageCount = await prisma.chatMessage.count({
    where: { conversationId },
  });

  if (messageCount <= 3) {
    // First exchange, generate a title
    const title = content.slice(0, 60) + (content.length > 60 ? "..." : "");
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  return message;
}

export async function executeFunction(
  conversationId: string,
  functionName: string,
  args: any
) {
  try {
    let result: any;
    let actionType: ChatActionType;
    let resourceType: string | undefined;
    let resourceId: string | undefined;

    switch (functionName) {
      case "create_contact": {
        actionType = ChatActionType.CREATE_CONTACT;
        const contact = await upsertContact({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone,
          source: "AI Chat",
          lifecycleStage: "LEAD",
        });
        resourceType = "contact";
        resourceId = contact.id;
        result = { contactId: contact.id, email: contact.email };

        // Update conversation with contact
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { contactId: contact.id },
        });

        // Log activity
        await prisma.activity.create({
          data: {
            contactId: contact.id,
            type: "NOTE",
            subject: "AI Chat Conversation",
            body: args.notes || "Contact created via AI chat assistant",
            activityAt: new Date(),
          },
        });

        break;
      }

      case "submit_course_enquiry": {
        actionType = ChatActionType.CREATE_ENQUIRY;
        
        // Try to find or create contact
        let contact = await prisma.contact.findUnique({
          where: { email: args.email },
        });

        if (!contact) {
          const nameParts = args.name.split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ") || firstName;

          contact = await upsertContact({
            firstName,
            lastName,
            email: args.email,
            phone: args.phone,
            source: "Course Enquiry - AI Chat",
            lifecycleStage: "MARKETING_QUALIFIED_LEAD",
          });
        }

        // For now, log as activity (in real implementation, would create CourseEnquiry)
        await prisma.activity.create({
          data: {
            contactId: contact.id,
            type: "NOTE",
            subject: `Course Enquiry: ${args.courseName}`,
            body: `${args.message}\n\nContact: ${args.name}\nEmail: ${args.email}\nPhone: ${args.phone || "Not provided"}`,
            activityAt: new Date(),
          },
        });

        resourceType = "enquiry";
        resourceId = contact.id;
        result = {
          enquiryCreated: true,
          contactId: contact.id,
          courseName: args.courseName,
        };
        break;
      }

      case "book_consultation": {
        actionType = ChatActionType.CREATE_BOOKING;

        // Create or update contact
        const nameParts = args.name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || firstName;

        const contact = await upsertContact({
          firstName,
          lastName,
          email: args.email,
          phone: args.phone,
          source: "Consultation Booking - AI Chat",
          lifecycleStage: "SALES_QUALIFIED_LEAD",
        });

        // Create activity for booking request
        await prisma.activity.create({
          data: {
            contactId: contact.id,
            type: "MEETING",
            subject: "Consultation Booking Request",
            body: `Concern: ${args.concern}\nPreferred Time: ${args.preferredTime || "Not specified"}\n\nRequested via AI chat assistant`,
            activityAt: new Date(),
          },
        });

        // Create task for follow-up
        await prisma.task.create({
          data: {
            contactId: contact.id,
            title: "Follow up on consultation booking",
            description: `Contact ${args.name} to schedule consultation.\nConcern: ${args.concern}`,
            priority: "HIGH",
            status: "PENDING",
          },
        });

        resourceType = "booking";
        resourceId = contact.id;
        result = {
          bookingRequested: true,
          contactId: contact.id,
          taskCreated: true,
        };
        break;
      }

      case "get_available_courses": {
        actionType = ChatActionType.FETCH_COURSES;
        
        // Fetch courses from database
        const courses = await prisma.course.findMany({
          where: {
            status: "PUBLISHED",
          },
          include: {
            pricing: {
              where: { isPrimary: true },
            },
            sessions: {
              where: {
                status: { in: ["UPCOMING", "IN_PROGRESS"] },
              },
              take: 3,
              orderBy: { startDate: "asc" },
            },
          },
          take: 10,
        });

        result = {
          courses: courses.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            level: c.level,
            pricing: c.pricing[0]
              ? {
                  amount: c.pricing[0].amount.toString(),
                  currency: c.pricing[0].currency,
                  billingType: c.pricing[0].billingType,
                }
              : null,
            upcomingSessions: c.sessions.length,
          })),
        };
        break;
      }

      default:
        throw new Error(`Unknown function: ${functionName}`);
    }

    // Log the action
    await prisma.chatAction.create({
      data: {
        conversationId,
        actionType,
        resourceType,
        resourceId,
        status: ChatActionStatus.COMPLETED,
        payload: args as any,
        result: result as any,
      },
    });

    return result;
  } catch (error) {
    // Log failed action
    await prisma.chatAction.create({
      data: {
        conversationId,
        actionType: ChatActionType.LOG_ACTIVITY,
        status: ChatActionStatus.FAILED,
        payload: { functionName, args } as any,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

export async function listConversations(
  input: z.infer<typeof conversationQuerySchema>
) {
  const data = conversationQuerySchema.parse(input);

  const where: any = {};
  if (data.sessionId) where.sessionId = data.sessionId;
  if (data.contactId) where.contactId = data.contactId;

  return prisma.chatConversation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: data.limit,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
  });
}

export async function getConversation(conversationId: string) {
  return prisma.chatConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      actions: {
        orderBy: { createdAt: "desc" },
      },
      contact: true,
    },
  });
}






