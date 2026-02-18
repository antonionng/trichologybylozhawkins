"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 1.5,
  size: 4 + Math.random() * 6,
  color: ["#fab826", "#ED908D", "#C1D780", "#80CCDD", "#D7ADCC"][
    Math.floor(Math.random() * 5)
  ],
  duration: 2 + Math.random() * 2,
}));

export function CompletionCelebration({
  courseId,
  totalLessons,
}: {
  courseId: string;
  totalLessons: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-[#fab826]/25 bg-gradient-to-br from-[#fab826]/10 via-[#fab826]/5 to-brand-sand/50 p-8 text-center"
    >
      {/* Confetti particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: ["0%", "120%"],
              opacity: [0, 1, 1, 0],
              rotate: [0, 360 * (p.id % 2 === 0 ? 1 : -1)],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeIn",
            }}
            className="absolute rounded-sm"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
        className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fab826]/20 text-3xl"
      >
        🎓
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative font-display text-xl font-semibold text-black"
      >
        Course Complete!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative mt-2 text-sm text-black/60"
      >
        You&apos;ve completed all {totalLessons} lessons. Well done — this
        knowledge will serve you and your clients for years to come.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="relative mt-6"
      >
        <Link
          href={`/academy/${courseId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-[#fab826] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#e5a820] hover:shadow-lg"
        >
          ← Back to Course Overview
        </Link>
      </motion.div>
    </motion.div>
  );
}
