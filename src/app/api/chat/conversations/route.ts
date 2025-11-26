import { NextRequest, NextResponse } from "next/server";
import { listConversations, getConversation } from "@/server/modules/chat/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const conversationId = searchParams.get("id");
    
    if (conversationId) {
      // Get specific conversation with full details
      const conversation = await getConversation(conversationId);
      
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(conversation);
    }
    
    // List conversations
    const sessionId = searchParams.get("sessionId") || undefined;
    const contactId = searchParams.get("contactId") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 10;

    const conversations = await listConversations({
      sessionId,
      contactId,
      limit,
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Chat conversations error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch conversations",
      },
      { status: 500 }
    );
  }
}

