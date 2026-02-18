"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  className?: string;
};

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={clsx("relative inline-flex", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 mb-2 w-max max-w-xs -translate-x-1/2 rounded-lg border border-black/10 bg-white px-3 py-2 text-[11px] font-medium text-black shadow-lg"
            style={{ zIndex: 50 }}
          >
            {content}
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white drop-shadow-sm" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}







