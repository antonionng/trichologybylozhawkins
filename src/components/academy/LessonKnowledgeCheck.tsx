"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

type KnowledgeQuestion = {
  question: string;
  type: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type Props = {
  questions: KnowledgeQuestion[];
  onComplete: () => void;
};

export function LessonKnowledgeCheck({ questions, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const q = questions[currentIndex];
  const isCorrect = selected === q?.correctAnswer;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setAnswered(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setAllDone(true);
      startTransition(() => {
        onComplete();
      });
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setAllDone(false);
  };

  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#fab826]/30 bg-gradient-to-br from-[#fab826]/10 via-white to-[#fab826]/5 p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fab826]/20 text-3xl">
          🎉
        </div>
        <h3 className="text-xl font-bold text-black">Knowledge Check Complete!</h3>
        <p className="mt-2 text-black/60">
          You scored <span className="font-semibold text-[#fab826]">{correctCount}</span> out of{" "}
          <span className="font-semibold">{questions.length}</span>
        </p>
        {isPending && (
          <p className="mt-3 text-sm text-black/40">Saving progress…</p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-black">Knowledge Check</h3>
        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i < currentIndex
                  ? "bg-[#fab826]"
                  : i === currentIndex
                  ? "bg-[#fab826]/60"
                  : "bg-black/10"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <p className="mb-4 text-sm font-medium text-black/50">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="mb-5 text-base font-semibold text-black">{q.question}</p>

          <div className="space-y-2.5">
            {q.options.map((option, idx) => {
              let style = "border-black/10 bg-white hover:border-[#fab826]/30";
              if (answered) {
                if (idx === q.correctAnswer) {
                  style = "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-400";
                } else if (idx === selected) {
                  style = "border-red-400 bg-red-50 ring-1 ring-red-400";
                } else {
                  style = "border-black/5 bg-black/[0.02] opacity-60";
                }
              } else if (idx === selected) {
                style = "border-[#fab826] bg-[#fab826]/5 ring-1 ring-[#fab826]";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={answered}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${style}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      answered && idx === q.correctAnswer
                        ? "bg-emerald-500 text-white"
                        : answered && idx === selected
                        ? "bg-red-500 text-white"
                        : idx === selected
                        ? "bg-[#fab826] text-white"
                        : "bg-black/5 text-black/40"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-black/80">{option}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 overflow-hidden"
            >
              <div
                className={`rounded-xl p-4 text-sm ${
                  isCorrect
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <p className="font-semibold">
                  {isCorrect ? "✓ Correct!" : "✗ Not quite"}
                </p>
                <p className="mt-1 text-sm opacity-80">{q.explanation}</p>
              </div>
            </motion.div>
          )}

          <div className="mt-5 flex justify-end">
            {!answered ? (
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="rounded-xl bg-[#fab826] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e5a820] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="rounded-xl bg-[#fab826] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e5a820]"
              >
                {currentIndex + 1 >= questions.length ? "Finish" : "Next Question →"}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
