"use client";

import { useMemo, useState } from "react";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { PurchaseButton } from "@/components/education/PurchaseButton";

type Question = {
  id: string;
  position: number;
  questionText: string;
  questionType: string;
  options: any;
  points: number;
};

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  course: { id: string; title: string; slug: string };
  questions: Question[];
};

type Props = {
  quiz: Quiz;
  submitUrl?: string;
  mode?: "academy" | "public_lead_gate";
  resultPrimaryCta?: { href: string; label: string };
  resultSecondaryCta?: { href: string; label: string };
};

type Answer = {
  questionId: string;
  answer: number | string;
};

type QuizResult = {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    answer: any;
    isCorrect: boolean;
  }>;
  band?: "low" | "medium" | "high";
  resultCopy?: { headline?: string; body?: string } | null;
  aiFeedback?: {
    headline?: string;
    summary?: string;
    strengths?: string[];
    gaps?: string[];
    nextSteps?: string[];
    recommendedCourseBlurb?: string;
  } | null;
  recommendedCourse?: { id: string; title: string; slug: string } | null;
  recommendedCourses?: Array<{
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    level: string;
    enrollmentType: string;
    primaryPrice: { id: string; amount: any; currency: string } | null;
    reason: string;
  }>;
};

export function QuizTaker({
  quiz,
  submitUrl,
  mode = "academy",
  resultPrimaryCta,
  resultSecondaryCta,
}: Props) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");

  const currentQuestion = quiz.questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  const handleAnswer = (questionId: string, answer: number | string) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, answer };
        return updated;
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length !== quiz.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    if (mode === "public_lead_gate") {
      setGateOpen(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const endpoint = submitUrl ?? `/api/academy/quiz/${quiz.id}/submit`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit quiz");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadName.trim() || !leadEmail.trim()) {
      setError("Please enter your name and email to unlock your results.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const endpoint = submitUrl ?? `/api/public/quiz/${quiz.id}/submit`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit quiz");
      }
      setResult(data);
      setGateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const primary = resultPrimaryCta ?? { href: "/contact", label: "Book consultation" };
    const secondary =
      resultSecondaryCta ??
      (mode === "academy" ? { href: "/academy", label: "Back to Academy" } : { href: "/education", label: "Explore academy" });

    const headline =
      result.aiFeedback?.headline ??
      result.resultCopy?.headline ??
      (result.passed ? "Congratulations!" : "Keep learning");
    const body =
      result.aiFeedback?.summary ??
      result.resultCopy?.body ??
      (result.passed
        ? "You passed the assessment!"
        : `You need ${quiz.passingScore}% to pass. Don’t give up — use the next steps below to improve quickly.`);
    const nextSteps = Array.isArray(result.aiFeedback?.nextSteps) ? result.aiFeedback?.nextSteps : [];
    const upsellCourses = Array.isArray(result.recommendedCourses) ? result.recommendedCourses : [];
    const [showAllCourses, setShowAllCourses] = useState(false);
    const visibleCourses = useMemo(() => {
      if (showAllCourses) return upsellCourses;
      return upsellCourses.slice(0, 6);
    }, [showAllCourses, upsellCourses]);

    return (
      <div className="space-y-8">
        <Surface variant="glass" padding="lg" className="text-center">
          <div
            className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${
              result.passed
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            <span className="text-4xl font-bold">{Math.round(result.percentage)}%</span>
          </div>
          <h1 className="text-2xl font-semibold text-black">{headline}</h1>
          <p className="mt-2 text-black/60">{body}</p>
        </Surface>

        {nextSteps.length ? (
          <Surface variant="card" padding="lg" className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">Next steps</p>
              <h2 className="mt-1 text-lg font-semibold text-black">What to focus on</h2>
            </div>
            <ul className="space-y-2 text-sm text-black/75">
              {nextSteps.slice(0, 5).map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#fab826]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            {result.aiFeedback?.recommendedCourseBlurb ? (
              <p className="text-sm text-black/70">{result.aiFeedback.recommendedCourseBlurb}</p>
            ) : null}
          </Surface>
        ) : null}

        <Surface variant="card" padding="lg" className="space-y-4">
          <h2 className="text-lg font-semibold text-black">Your Results</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-semibold text-black">{result.score}</p>
              <p className="text-xs text-black/50">Points</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-black">{result.maxScore}</p>
              <p className="text-xs text-black/50">Max Points</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-black">
                {result.answers.filter((a) => a.isCorrect).length}/{quiz.questions.length}
              </p>
              <p className="text-xs text-black/50">Correct</p>
            </div>
          </div>
        </Surface>

        {upsellCourses.length ? (
          <Surface variant="card" padding="lg" className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">Recommended courses</p>
              <h2 className="mt-1 text-lg font-semibold text-black">Keep learning</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {visibleCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/80 p-4"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-black/40">
                      {course.enrollmentType?.replace(/_/g, " ") || "Course"}
                    </p>
                    <Link
                      href={`/education/${course.slug}`}
                      className="text-sm font-semibold text-black hover:text-[#b67400]"
                    >
                      {course.title}
                    </Link>
                    <p className="text-xs text-black/60 line-clamp-3">
                      {course.subtitle ?? course.description ?? ""}
                    </p>
                    <p className="mt-2 text-xs text-black/60">{course.reason}</p>
                  </div>

                  <div className="mt-auto space-y-2">
                    {course.primaryPrice ? (
                      <PurchaseButton
                        courseId={course.id}
                        priceId={course.primaryPrice.id}
                        amount={Number(course.primaryPrice.amount)}
                        currency={course.primaryPrice.currency}
                      />
                    ) : (
                      <Link
                        href="/contact"
                        className="inline-flex w-full items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black/70 hover:border-black/30"
                      >
                        Enquire
                      </Link>
                    )}
                    <Link
                      href={`/education/${course.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-[#fab826]/30 bg-[#fab826]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#b67400] hover:border-[#fab826] hover:bg-[#fab826]/20"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {upsellCourses.length > 6 ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllCourses((v) => !v)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black/60 hover:border-black/20 hover:text-black"
                >
                  {showAllCourses ? "Show less" : `Show all (${upsellCourses.length})`}
                </button>
              </div>
            ) : null}
          </Surface>
        ) : null}

        <Surface variant="card" padding="lg" className="space-y-4">
          <h2 className="text-lg font-semibold text-black">Question Review</h2>
          <div className="space-y-3">
            {quiz.questions.map((q, i) => {
              const answer = result.answers.find((a) => a.questionId === q.id);
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4 ${
                    answer?.isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        answer?.isCorrect ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                      }`}
                    >
                      Q{i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-black">{q.questionText}</p>
                      <p className="mt-1 text-xs text-black/60">
                        Your answer:{" "}
                        {q.questionType === "TRUE_FALSE" && typeof answer?.answer === "number"
                          ? ["True", "False"][answer.answer] ?? "No answer"
                          : typeof answer?.answer === "number" && Array.isArray(q.options)
                          ? q.options[answer.answer]
                          : String(answer?.answer || "No answer")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Surface>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={secondary.href}
            className="rounded-xl border border-black/10 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black/70 transition hover:border-black/30 hover:bg-white/90"
          >
            {secondary.label}
          </Link>
          <Link
            href={primary.href}
            className="rounded-xl border border-[#fab826]/40 bg-[#fab826]/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#b67400] transition hover:border-[#fab826] hover:bg-[#fab826]/20"
          >
            {primary.label}
          </Link>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setResult(null);
              setAnswers([]);
              setCurrentIndex(0);
              setStarted(false);
              setGateOpen(false);
              setLeadName("");
              setLeadEmail("");
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (gateOpen) {
    return (
      <Surface variant="glass" padding="lg" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">Unlock your results</p>
          <h1 className="mt-2 text-2xl font-semibold text-black">Get your personalised feedback</h1>
          <p className="mt-2 text-sm text-black/60">
            Enter your details to see your score breakdown and Lorraine’s recommended next steps.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Name</label>
            <input
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm focus:border-[#fab826] focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Email</label>
            <input
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm focus:border-[#fab826] focus:outline-none"
              placeholder="you@example.com"
              inputMode="email"
            />
          </div>
        </div>

        {error ? <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="md" onClick={handleLeadSubmit} disabled={submitting}>
            {submitting ? "Unlocking..." : "Unlock results"}
          </Button>
          <Button variant="secondary" size="md" onClick={() => setGateOpen(false)} disabled={submitting}>
            Back to quiz
          </Button>
        </div>
      </Surface>
    );
  }

  if (!started) {
    return (
      <Surface variant="glass" padding="lg" className="space-y-6 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            {quiz.course.title}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-black">{quiz.title}</h1>
          {quiz.description && (
            <p className="mt-3 text-black/60">{quiz.description}</p>
          )}
        </div>

        <div className="mx-auto grid max-w-sm grid-cols-3 gap-4 py-4">
          <div className="rounded-xl bg-white/70 p-4">
            <p className="text-2xl font-semibold text-black">{quiz.questions.length}</p>
            <p className="text-xs text-black/50">Questions</p>
          </div>
          <div className="rounded-xl bg-white/70 p-4">
            <p className="text-2xl font-semibold text-black">{quiz.passingScore}%</p>
            <p className="text-xs text-black/50">To Pass</p>
          </div>
          <div className="rounded-xl bg-white/70 p-4">
            <p className="text-2xl font-semibold text-black">
              {quiz.timeLimit ? `${quiz.timeLimit}m` : "∞"}
            </p>
            <p className="text-xs text-black/50">Time Limit</p>
          </div>
        </div>

        <Button variant="primary" size="lg" onClick={() => setStarted(true)}>
          Start Quiz
        </Button>
      </Surface>
    );
  }

  return (
    <div className="space-y-6">
      <Surface variant="glass" padding="md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">{quiz.title}</p>
            <p className="text-sm text-black">
              Question {currentIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-black/40">{answers.length} answered</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full bg-[#fab826] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Surface>

      <Surface variant="card" padding="lg" className="space-y-6">
        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
              currentQuestion.questionType === "MULTIPLE_CHOICE"
                ? "bg-blue-100 text-blue-700"
                : currentQuestion.questionType === "TRUE_FALSE"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {currentQuestion.questionType.replace("_", " ")}
          </span>
          <p className="mt-4 text-lg text-black">{currentQuestion.questionText}</p>
        </div>

        <div className="space-y-3">
          {currentQuestion.questionType === "MULTIPLE_CHOICE" &&
            Array.isArray(currentQuestion.options) && (
              <>
                {(currentQuestion.options as string[]).map((option, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAnswer(currentQuestion.id, i)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      currentAnswer?.answer === i
                        ? "border-[#fab826] bg-[#fab826]/10"
                        : "border-black/10 bg-white hover:border-black/20"
                    }`}
                  >
                    <span className="mr-3 font-semibold text-black/40">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="text-black">{option}</span>
                  </button>
                ))}
              </>
            )}

          {currentQuestion.questionType === "TRUE_FALSE" && (
            <div className="grid grid-cols-2 gap-4">
              {["True", "False"].map((option, i) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(currentQuestion.id, i)}
                  className={`rounded-xl border p-6 text-center text-lg font-semibold transition ${
                    currentAnswer?.answer === i
                      ? "border-[#fab826] bg-[#fab826]/10"
                      : "border-black/10 bg-white hover:border-black/20"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.questionType === "SHORT_ANSWER" && (
            <textarea
              value={String(currentAnswer?.answer || "")}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 focus:border-[#fab826] focus:outline-none"
              placeholder="Type your answer here..."
            />
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
      </Surface>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← Previous
        </Button>

        {currentIndex === quiz.questions.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={handleNext}>
            Next →
          </Button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {quiz.questions.map((q, i) => {
          const hasAnswer = answers.some((a) => a.questionId === q.id);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                i === currentIndex
                  ? "bg-[#fab826] text-white"
                  : hasAnswer
                  ? "bg-green-100 text-green-700"
                  : "bg-black/10 text-black/50 hover:bg-black/20"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

