"use client";

import { motion } from "framer-motion";
import { Surface } from "@/components/layout/Surface";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
};

type ChatMessageProps = {
  message: Message;
  isStreaming?: boolean;
};

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) return null; // Don't display system messages

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.95, 0.45, 1] }}
      className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div className={clsx("max-w-[85%]", isUser ? "items-end" : "items-start")}>
        {!isUser && (
          <div className="mb-1 text-xs text-black/40">Lorraine's Assistant</div>
        )}
        
        {isUser ? (
          <div className="rounded-2xl bg-brand-salmon/20 px-4 py-3 text-sm leading-relaxed text-black/90">
            {message.content}
          </div>
        ) : (
          <Surface
            variant="glass"
            padding="sm"
            className="text-sm leading-relaxed text-black/80"
          >
            <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-black/90 prose-p:text-black/80 prose-strong:text-black/90 prose-ul:text-black/80 prose-ol:text-black/80">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-1 inline-block h-4 w-1 bg-[#fab826]"
                />
              )}
            </div>
          </Surface>
        )}
        
        {message.createdAt && (
          <div className="mt-1 text-xs text-black/30">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <Surface variant="glass" padding="sm" className="w-16">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="h-2 w-2 rounded-full bg-black/30"
            />
          ))}
        </div>
      </Surface>
    </motion.div>
  );
}

