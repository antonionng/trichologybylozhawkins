"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage, TypingIndicator, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { motion, AnimatePresence } from "framer-motion";
import { Surface } from "@/components/layout/Surface";
import { SUGGESTED_PROMPTS } from "@/lib/chatPrompts";

type ChatInterfaceProps = {
  sessionId?: string;
  contactId?: string;
  initialMessage?: string;
  suggestions?: string[];
  embedded?: boolean;
};

export function ChatInterface({
  sessionId,
  contactId,
  initialMessage,
  suggestions = SUGGESTED_PROMPTS.slice(0, 3),
  embedded = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialLoadRef = useRef(true);

  // Auto-scroll to bottom (only after initial load)
  const scrollToBottom = () => {
    if (!isInitialLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  // Load existing conversation
  useEffect(() => {
    const loadConversation = async () => {
      if (sessionId && !conversationId) {
        try {
          const response = await fetch(
            `/api/chat/conversations?sessionId=${sessionId}`
          );
          if (response.ok) {
            const conversations = await response.json();
            if (conversations.length > 0) {
              const latest = conversations[0];
              setConversationId(latest.id);
              
              // Load messages
              const detailResponse = await fetch(
                `/api/chat/conversations?id=${latest.id}`
              );
              if (detailResponse.ok) {
                const conversation = await detailResponse.json();
                setMessages(
                  conversation.messages.map((m: any) => ({
                    id: m.id,
                    role: m.role.toLowerCase(),
                    content: m.content,
                    createdAt: new Date(m.createdAt),
                  }))
                );
              }
            }
          }
        } catch (error) {
          console.error("Failed to load conversation:", error);
        } finally {
          // Mark initial load as complete
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 100);
        }
      } else {
        // No session to load, mark as complete immediately
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 100);
      }
    };

    loadConversation();
  }, [sessionId]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Mark as no longer initial load when user interacts
      isInitialLoadRef.current = false;
      
      // Add user message immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setIsStreaming(false);
      setStreamingContent("");

      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            conversationId,
            sessionId,
            contactId,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response stream");
        }

        setIsLoading(false);
        setIsStreaming(true);
        let currentContent = "";
        let currentConversationId = conversationId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.conversationId && !currentConversationId) {
                  currentConversationId = data.conversationId;
                  setConversationId(data.conversationId);
                }

                switch (data.type) {
                  case "content":
                    currentContent += data.content;
                    setStreamingContent(currentContent);
                    break;

                  case "function_call":
                    // Add a message about the action
                    const actionMessage = getActionMessage(
                      data.function,
                      data.result
                    );
                    if (actionMessage) {
                      currentContent += `\n\n${actionMessage}`;
                      setStreamingContent(currentContent);
                    }
                    break;

                  case "done":
                    // Finalize the assistant message
                    if (currentContent) {
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `msg-${Date.now()}`,
                          role: "assistant",
                          content: currentContent,
                          createdAt: new Date(),
                        },
                      ]);
                    }
                    setStreamingContent("");
                    setIsStreaming(false);
                    break;

                  case "error":
                    console.error("Stream error:", data.error);
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `error-${Date.now()}`,
                        role: "assistant",
                        content: `I apologize, but I encountered an error: ${data.error}. Please try again.`,
                        createdAt: new Date(),
                      },
                    ]);
                    setStreamingContent("");
                    setIsStreaming(false);
                    break;
                }
              } catch (e) {
                console.error("Failed to parse SSE data:", e);
              }
            }
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
          return;
        }

        console.error("Send message error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
            createdAt: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [conversationId, sessionId, contactId]
  );

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setStreamingContent("");
    setIsStreaming(false);
    isInitialLoadRef.current = false;
  };

  return (
    <div
      className={`flex flex-col ${embedded ? "h-[600px]" : "h-full"} bg-brand-ivory/50`}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-black/5 bg-white/60 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-black/90">
              Chat with Lorraine's Assistant
            </h3>
            <p className="text-xs text-black/50">
              Ask about scalp health, services, or courses
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs text-black/60 transition hover:border-brand-salmon/50 hover:bg-brand-salmon/10"
            >
              New conversation
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="py-8 text-center">
              <div className="mb-4 text-4xl">👋</div>
              <h4 className="mb-2 font-display text-xl text-black/80">
                Hello! How can I help you today?
              </h4>
              <p className="text-sm text-black/60">
                I'm here to answer questions about trichology, scalp health, and
                Lorraine's services and courses.
              </p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isStreaming && streamingContent && (
            <ChatMessage
              message={{
                id: "streaming",
                role: "assistant",
                content: streamingContent,
              }}
              isStreaming
            />
          )}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-black/5 bg-white/60 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading || isStreaming}
            suggestions={messages.length === 0 ? suggestions : undefined}
          />
        </div>
      </div>
    </div>
  );
}

function getActionMessage(functionName: string, result: any): string | null {
  switch (functionName) {
    case "create_contact":
      return "✓ I've saved your details. Lorraine's team will be in touch soon.";
    case "submit_course_enquiry":
      return "✓ Your course enquiry has been submitted. You'll receive more information via email within 24 hours.";
    case "book_consultation":
      return "✓ Your consultation request has been received. The team will contact you within 24 hours to confirm your appointment.";
    default:
      return null;
  }
}

