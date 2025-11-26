"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "./ChatInterface";
import { Surface } from "@/components/layout/Surface";

type EmbeddedChatProps = {
  title?: string;
  description?: string;
  initialMessage?: string;
  suggestions?: string[];
};

export function EmbeddedChat({
  title = "Have questions? Chat with us",
  description = "Get instant answers about our services, courses, and scalp health guidance",
  initialMessage,
  suggestions,
}: EmbeddedChatProps) {
  const [sessionId, setSessionId] = useState<string>("");

  // Generate or retrieve session ID
  useEffect(() => {
    let sid = localStorage.getItem("chat-session-id");
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("chat-session-id", sid);
    }
    setSessionId(sid);
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="mb-2 font-display text-2xl text-black/90">{title}</h3>
        <p className="text-sm text-black/60">{description}</p>
      </div>

      {/* Chat Interface */}
      <Surface variant="glass" padding="none" className="overflow-hidden">
        <ChatInterface
          sessionId={sessionId}
          initialMessage={initialMessage}
          suggestions={suggestions}
          embedded
        />
      </Surface>
    </div>
  );
}






