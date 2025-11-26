import { NextRequest, NextResponse } from "next/server";
import {
  sendMessage,
  streamChatCompletion,
  saveAssistantMessage,
  executeFunction,
} from "@/server/modules/chat/service";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Send message and get conversation context
    const { conversationId, messages } = await sendMessage(body);

    // Create streaming response
    const { stream } = await streamChatCompletion(messages, conversationId);

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let fullContent = "";
    let functionCall: any = null;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
              fullContent += delta.content;
              
              // Send content chunk to client
              const data = JSON.stringify({
                type: "content",
                content: delta.content,
                conversationId,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            if (delta?.function_call) {
              if (!functionCall) {
                functionCall = {
                  name: delta.function_call.name,
                  arguments: delta.function_call.arguments || "",
                };
              } else {
                functionCall.arguments += delta.function_call.arguments || "";
              }
            }

            // Check if stream is done
            if (chunk.choices[0]?.finish_reason === "function_call") {
              // Execute the function
              try {
                const args = JSON.parse(functionCall.arguments);
                const result = await executeFunction(
                  conversationId,
                  functionCall.name,
                  args
                );

                // Send function result to client
                const functionData = JSON.stringify({
                  type: "function_call",
                  function: functionCall.name,
                  result,
                  conversationId,
                });
                controller.enqueue(encoder.encode(`data: ${functionData}\n\n`));

                // Save assistant message with function call
                await saveAssistantMessage(
                  conversationId,
                  `[Function call: ${functionCall.name}]`,
                  functionCall
                );
              } catch (error) {
                const errorData = JSON.stringify({
                  type: "error",
                  error:
                    error instanceof Error
                      ? error.message
                      : "Function execution failed",
                  conversationId,
                });
                controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
              }
            } else if (chunk.choices[0]?.finish_reason === "stop") {
              // Save the complete assistant message
              if (fullContent) {
                await saveAssistantMessage(conversationId, fullContent);
              }

              // Send completion signal
              const doneData = JSON.stringify({
                type: "done",
                conversationId,
              });
              controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
            }
          }

          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Stream error",
            conversationId,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 }
    );
  }
}






