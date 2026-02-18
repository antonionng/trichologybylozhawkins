"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function KeyTakeawaysCard({ takeaways }: { takeaways: string[] }) {
  const [expanded, setExpanded] = useState(true);

  if (takeaways.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#fab826]/20 bg-gradient-to-br from-[#fab826]/8 via-[#fab826]/5 to-transparent">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-[#fab826]/5 lg:cursor-default lg:pointer-events-none"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fab826]/15 text-lg">
          🎯
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold tracking-wide text-black/80">
            What You&apos;ll Take Away
          </p>
          <p className="text-xs text-black/40">
            Key points from this lesson
          </p>
        </div>
        <span className="text-xs text-black/30 lg:hidden">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="space-y-2.5 border-t border-[#fab826]/10 px-6 py-5">
              {takeaways.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#fab826]" />
                  <span className="text-sm leading-relaxed text-black/70">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
