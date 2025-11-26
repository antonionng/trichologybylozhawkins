"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: string[];
};

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask me anything about scalp health, courses, or services...",
  suggestions,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!disabled) {
      onSend(suggestion);
    }
  };

  return (
    <div className="space-y-3">
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={disabled}
              className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs text-black/70 transition hover:border-brand-salmon/50 hover:bg-brand-salmon/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={clsx(
              "w-full resize-none rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm leading-relaxed text-black/90 placeholder:text-black/40",
              "focus:border-brand-salmon/50 focus:outline-none focus:ring-2 focus:ring-brand-salmon/20",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "max-h-32 overflow-y-auto"
            )}
            style={{ minHeight: "48px" }}
          />
        </div>

        <motion.button
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={clsx(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition",
            "bg-brand-salmon text-white hover:bg-brand-salmon/90",
            "disabled:cursor-not-allowed disabled:opacity-40"
          )}
          aria-label="Send message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </div>

      <p className="text-xs text-black/40">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}

