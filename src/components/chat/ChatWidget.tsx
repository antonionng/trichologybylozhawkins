"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChatInterface } from "./ChatInterface";
import clsx from "clsx";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const shouldReduceMotion = useReducedMotion();

  // Generate or retrieve session ID
  useEffect(() => {
    let sid = localStorage.getItem("chat-session-id");
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("chat-session-id", sid);
    }
    setSessionId(sid);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={toggleChat}
            />

            {/* Chat Panel */}
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 20 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 20 }
              }
              transition={{ duration: 0.3, ease: [0.25, 0.95, 0.45, 1] }}
              className={clsx(
                "fixed z-[70] overflow-hidden rounded-3xl shadow-2xl",
                // Mobile: full screen with some padding
                "inset-4 lg:inset-auto",
                // Desktop: bottom-right corner
                "lg:bottom-24 lg:right-6 lg:h-[680px] lg:w-[420px]",
                // Glassmorphism
                "border border-black/10 bg-white/95 backdrop-blur-lg"
              )}
            >
              {/* Close button */}
              <button
                onClick={toggleChat}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-black/50 transition hover:bg-black/10 hover:text-black/70"
                aria-label="Close chat"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <ChatInterface sessionId={sessionId} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }
            }
            animate={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
            }
            exit={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }
            }
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.95, 0.45, 1] }}
            onClick={toggleChat}
            className={clsx(
              "fixed z-50 flex items-center gap-3 rounded-full shadow-lg transition",
              "bottom-6 right-6",
              "bg-brand-salmon px-5 py-4 text-white hover:bg-brand-salmon/90",
              "group"
            )}
            aria-label="Open chat"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M21 11.5C21 16.75 16.75 21 11.5 21C10.39 21 9.32 20.82 8.31 20.49L3 22L4.51 16.69C4.18 15.68 4 14.61 4 13.5C4 8.25 8.25 4 13.5 4C18.75 4 23 8.25 23 13.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="13" r="1" fill="currentColor" />
              <circle cx="13" cy="13" r="1" fill="currentColor" />
              <circle cx="17" cy="13" r="1" fill="currentColor" />
            </svg>

            <span className="hidden font-medium sm:inline">
              Ask me anything
            </span>

            {/* Pulse indicator */}
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-brand-salmon"
              style={{ zIndex: -1 }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

