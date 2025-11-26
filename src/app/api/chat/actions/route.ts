import { NextRequest, NextResponse } from "next/server";
import { executeFunction } from "@/server/modules/chat/service";
import { executeActionSchema } from "@/server/schema/chat";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = executeActionSchema.parse(body);

    // Map action type to function name
    const functionMap: Record<string, string> = {
      CREATE_CONTACT: "create_contact",
      CREATE_ENQUIRY: "submit_course_enquiry",
      CREATE_BOOKING: "book_consultation",
      FETCH_COURSES: "get_available_courses",
    };

    const functionName = functionMap[data.actionType];
    if (!functionName) {
      return NextResponse.json(
        { error: `Unknown action type: ${data.actionType}` },
        { status: 400 }
      );
    }

    const result = await executeFunction(
      data.conversationId,
      functionName,
      data.payload
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Chat action error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to execute action",
      },
      { status: 500 }
    );
  }
}






