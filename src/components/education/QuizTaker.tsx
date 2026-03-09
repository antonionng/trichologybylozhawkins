"use client";

import { useMemo, useState } from "react";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { PurchaseButton } from "@/components/education/PurchaseButton";
import {
  getConsumerQuizGateCopy,
  getConsumerQuizIntro,
  getConsumerQuizQuestionCopy,
  getConsumerQuizResultCopy,
} from "@/lib/consumerQuizPresentation";

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
  mode?: "academy" | "public_lead_gate" | "public_consumer";
  resultPrimaryCta?: { href: string; label: string };
  resultSecondaryCta?: { href: string; label: string };
};

type Answer = {
  questionId: string;
  answer: number | string;
};

type QuizResult = {
  resultMode?: "consumer_scalp";
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    answer: any;
    isCorrect: boolean;
    answerLabel?: string | null;
  }>;
  headline?: string;
  summary?: string;
  triage?: "routine" | "prompt";
  nextSteps?: string[];
  primaryConcern?: {
    key: string;
    label: string;
    possibleConditions?: string[];
  } | null;
  secondaryConcern?: {
    key: string;
    label: string;
  } | null;
  redFlags?: string[];
  bookingCta?: { href: string; label: string } | null;
  secondaryCta?: { href: string; label: string } | null;
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
  const [showAllCourses, setShowAllCourses] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const isConsumerMode = mode === "public_consumer";
  const consumerIntro = getConsumerQuizIntro(quiz.questions.length);
  const consumerQuestionCopy = getConsumerQuizQuestionCopy(currentIndex + 1, quiz.questions.length);
  const consumerGateCopy = getConsumerQuizGateCopy();
  const consumerResultCopy = getConsumerQuizResultCopy();
  const upsellCourses = useMemo(
    () => (Array.isArray(result?.recommendedCourses) ? result.recommendedCourses : []),
    [result?.recommendedCourses]
  );
  const visibleCourses = useMemo(() => {
    if (showAllCourses) return upsellCourses;
    return upsellCourses.slice(0, 6);
  }, [showAllCourses, upsellCourses]);

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

  const resetQuiz = () => {
    setResult(null);
    setAnswers([]);
    setCurrentIndex(0);
    setStarted(false);
    setGateOpen(false);
    setLeadName("");
    setLeadEmail("");
    setShowAllCourses(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (answers.length !== quiz.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    if (mode === "public_lead_gate" || mode === "public_consumer") {
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
    if (result.resultMode === "consumer_scalp") {
      const primary = result.bookingCta ?? resultPrimaryCta ?? { href: "/contact?service=clinic", label: "Book a scalp consultation with Lorraine" };
      const secondary = result.secondaryCta ?? resultSecondaryCta ?? { href: "/education/conditions", label: "Learn about scalp concerns" };
      const redFlags = Array.isArray(result.redFlags) ? result.redFlags : [];
      const likelyConditions = Array.isArray(result.primaryConcern?.possibleConditions)
        ? result.primaryConcern?.possibleConditions ?? []
        : [];

      return (
        <div className="space-y-6">
          <Surface variant="glass" padding="lg" className="overflow-hidden">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start">
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-[#fab826]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-[#9f6c08]">
                  {consumerResultCopy.eyebrow}
                </span>
                <div className="space-y-3">
                  <h1 className="font-display text-3xl leading-[1.1] text-brand-graphite sm:text-[2.7rem]">
                    {result.headline ?? "Your answers suggest a likely scalp concern pattern."}
                  </h1>
                  <p className="max-w-2xl text-base leading-relaxed text-brand-graphite/65">
                    {result.summary ?? "Use this as a guided starting point, then book with Lorraine for tailored advice."}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-brand-graphite/8 bg-brand-sand/35 p-5 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.35)]">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-graphite/40">
                  Consultation support
                </p>
                <div className="mt-3 space-y-3">
                  <p className="text-sm leading-relaxed text-brand-graphite/70">
                    If you want a more personal assessment, Lorraine can review your pattern, history, and next best options in a consultation.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={primary.href}
                      className="inline-flex items-center justify-center rounded-full bg-brand-graphite px-6 py-3 text-sm font-semibold text-brand-ivory transition hover:bg-brand-graphite/90"
                    >
                      {primary.label}
                    </Link>
                    <Link
                      href={secondary.href}
                      className="inline-flex items-center justify-center rounded-full border border-brand-graphite/15 bg-white px-6 py-3 text-sm font-semibold text-brand-graphite/70 transition hover:border-brand-graphite/30 hover:text-brand-graphite"
                    >
                      {secondary.label}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Surface>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.86fr)]">
            <Surface variant="card" padding="lg" className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/40">
                  {consumerResultCopy.concernLabel}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-brand-graphite">
                  {result.primaryConcern?.label ?? "Scalp concern pattern"}
                </h2>
              </div>

              {likelyConditions.length ? (
                <p className="text-sm leading-relaxed text-brand-graphite/65">
                  This can overlap with {likelyConditions.join(", ").toLowerCase()}. Lorraine can help narrow down which pattern looks most relevant to your history and symptoms.
                </p>
              ) : null}

              {result.secondaryConcern?.label ? (
                <div className="rounded-[1.4rem] bg-brand-mist/35 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-brand-graphite/40">
                    {consumerResultCopy.secondaryPatternLabel}
                  </p>
                  <p className="mt-2 text-sm font-medium text-brand-graphite">{result.secondaryConcern.label}</p>
                </div>
              ) : null}
            </Surface>

            <Surface
              variant="card"
              padding="lg"
              className={
                redFlags.length
                  ? "space-y-3 border border-red-200 bg-red-50/85"
                  : "space-y-3 bg-white/90"
              }
            >
              <div>
                <p
                  className={`text-xs uppercase tracking-[0.3em] ${
                    redFlags.length ? "text-red-500" : "text-brand-graphite/40"
                  }`}
                >
                  {redFlags.length ? consumerResultCopy.followUpLabel : consumerResultCopy.summaryLabel}
                </p>
                <h2
                  className={`mt-1 text-lg font-semibold ${
                    redFlags.length ? "text-red-700" : "text-brand-graphite"
                  }`}
                >
                  {redFlags.length ? "These answers are worth assessing sooner" : "A calmer starting point, not a final diagnosis"}
                </h2>
              </div>

              {redFlags.length ? (
                <ul className="space-y-2 text-sm text-red-700">
                  {redFlags.map((flag) => (
                    <li key={flag} className="flex gap-3">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed text-brand-graphite/65">
                  This summary is designed to give you a clearer sense of direction. If symptoms are persistent, worsening, or worrying, booking with Lorraine is the best next step.
                </p>
              )}
            </Surface>
          </div>

          {Array.isArray(result.nextSteps) && result.nextSteps.length ? (
            <Surface variant="card" padding="lg" className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/40">
                  {consumerResultCopy.nextStepsLabel}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-brand-graphite">Lorraine would suggest starting here</h2>
              </div>
              <div className="grid gap-3">
                {result.nextSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-4 rounded-[1.5rem] border border-brand-graphite/8 bg-white/90 p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-sand text-sm font-semibold text-brand-graphite">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-brand-graphite/75">{step}</p>
                  </div>
                ))}
              </div>
            </Surface>
          ) : null}

          <Surface variant="card" padding="lg" className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/40">What you shared</p>
              <h2 className="mt-1 text-xl font-semibold text-brand-graphite">Your answers at a glance</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {quiz.questions.map((q, i) => {
                const answer = result.answers.find((a) => a.questionId === q.id);
                return (
                  <div
                    key={q.id}
                    className="rounded-[1.45rem] border border-brand-graphite/8 bg-brand-sand/20 p-4"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-graphite/35">
                      Step {i + 1}
                    </p>
                    <p className="mt-2 text-sm font-medium text-brand-graphite">{q.questionText}</p>
                    <p className="mt-2 text-sm text-brand-graphite/60">
                      {answer?.answerLabel ??
                        (typeof answer?.answer === "number" && Array.isArray(q.options)
                          ? q.options[answer.answer]
                          : String(answer?.answer || "No answer"))}
                    </p>
                  </div>
                );
              })}
            </div>
          </Surface>

          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="ghost" size="md" onClick={resetQuiz}>
              {consumerResultCopy.restartLabel}
            </Button>
          </div>
        </div>
      );
    }

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
              setShowAllCourses(false);
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (gateOpen) {
    if (isConsumerMode) {
      return (
        <Surface variant="glass" padding="lg" className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-[#fab826]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-[#9f6c08]">
                {consumerGateCopy.eyebrow}
              </span>
              <div className="space-y-3">
                <h1 className="font-display text-3xl leading-[1.1] text-brand-graphite sm:text-[2.5rem]">
                  {consumerGateCopy.title}
                </h1>
                <p className="text-base leading-relaxed text-brand-graphite/65">
                  {consumerGateCopy.body}
                </p>
              </div>
              <div className="space-y-3 rounded-[1.6rem] border border-brand-graphite/8 bg-white/70 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-graphite/38">
                  What you will see
                </p>
                <ul className="space-y-2 text-sm text-brand-graphite/70">
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#fab826]" />
                    <span>Your likely concern pattern</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#fab826]" />
                    <span>Clear next steps from Lorraine</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#fab826]" />
                    <span>A direct route into a consultation if you want help</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-brand-graphite/8 bg-white/90 p-5 shadow-[0_16px_38px_-28px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-graphite/60">Name</label>
                  <input
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full rounded-2xl border border-brand-graphite/12 bg-brand-sand/10 px-4 py-3 text-sm focus:border-[#fab826] focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-brand-graphite/60">Email</label>
                  <input
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full rounded-2xl border border-brand-graphite/12 bg-brand-sand/10 px-4 py-3 text-sm focus:border-[#fab826] focus:outline-none"
                    placeholder="you@example.com"
                    inputMode="email"
                  />
                </div>
              </div>

              {error ? <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="primary" size="md" onClick={handleLeadSubmit} disabled={submitting}>
                  {submitting ? "Preparing your guidance..." : consumerGateCopy.submitLabel}
                </Button>
                <Button variant="ghost" size="md" onClick={() => setGateOpen(false)} disabled={submitting}>
                  {consumerGateCopy.backLabel}
                </Button>
              </div>
            </div>
          </div>
        </Surface>
      );
    }

    return (
      <Surface variant="glass" padding="lg" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">Unlock your results</p>
          <h1 className="mt-2 text-2xl font-semibold text-black">Get your personalised feedback</h1>
          <p className="mt-2 text-sm text-black/60">
            {isConsumerMode
              ? "Enter your details to see your likely concern pattern and Lorraine’s recommended next steps."
              : "Enter your details to see your score breakdown and Lorraine’s recommended next steps."}
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
    if (isConsumerMode) {
      return (
        <Surface variant="glass" padding="lg" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-[#fab826]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-[#9f6c08]">
                {consumerIntro.eyebrow}
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-graphite/35">
                  {quiz.course.title}
                </p>
                <h1 className="mt-2 font-display text-3xl leading-[1.08] text-brand-graphite sm:text-[2.75rem]">
                  {quiz.title}
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-brand-graphite/65">
                {quiz.description ?? consumerIntro.body}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {consumerIntro.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-[1.5rem] border border-brand-graphite/8 bg-white/80 p-4 text-sm leading-relaxed text-brand-graphite/70"
                >
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.86fr)]">
            <div className="rounded-[1.7rem] border border-brand-graphite/8 bg-brand-sand/25 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-graphite/40">
                What happens
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-graphite">1</span>
                  <p className="text-sm text-brand-graphite/70">Answer a few gentle questions about what you are noticing.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-graphite">2</span>
                  <p className="text-sm text-brand-graphite/70">See a likely concern pattern and practical next steps.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-graphite">3</span>
                  <p className="text-sm text-brand-graphite/70">Book with Lorraine if you want tailored support.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-brand-graphite/8 bg-white/85 p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.35)]">
              <p className="text-sm leading-relaxed text-brand-graphite/70">{consumerIntro.reassurance}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="primary" size="lg" onClick={() => setStarted(true)}>
                  {consumerIntro.startLabel}
                </Button>
              </div>
            </div>
          </div>
        </Surface>
      );
    }

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

        {isConsumerMode ? (
          <div className="mx-auto grid max-w-2xl gap-3 py-2 sm:grid-cols-3">
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-2xl font-semibold text-black">{quiz.questions.length}</p>
              <p className="text-xs text-black/50">Guided questions</p>
            </div>
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-2xl font-semibold text-black">Likely</p>
              <p className="text-xs text-black/50">Concern patterns</p>
            </div>
            <div className="rounded-xl bg-white/70 p-4">
              <p className="text-2xl font-semibold text-black">Book</p>
              <p className="text-xs text-black/50">Lorraine if needed</p>
            </div>
          </div>
        ) : (
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
        )}

        <Button variant="primary" size="lg" onClick={() => setStarted(true)}>
          {isConsumerMode ? "Start scalp check" : "Start Quiz"}
        </Button>
      </Surface>
    );
  }

  return (
    <div className="space-y-6">
      <Surface
        variant="glass"
        padding="md"
        className={isConsumerMode ? "space-y-4 rounded-[2rem]" : ""}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">{quiz.title}</p>
            <p className="text-sm text-black">
              {isConsumerMode
                ? consumerQuestionCopy.stepLabel
                : `Question ${currentIndex + 1} of ${quiz.questions.length}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-black/40">
              {isConsumerMode
                ? `${answers.length}/${quiz.questions.length} ${consumerQuestionCopy.answeredLabel.toLowerCase()}`
                : `${answers.length} answered`}
            </p>
          </div>
        </div>
        <div className={`overflow-hidden ${isConsumerMode ? "rounded-full bg-brand-graphite/5" : "mt-3 h-2 rounded-full bg-black/10"}`}>
          <div
            className={`transition-all ${isConsumerMode ? "h-2.5 rounded-full bg-[#28577F]" : "h-full bg-[#fab826]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </Surface>

      <Surface
        variant="card"
        padding="lg"
        className={isConsumerMode ? "space-y-6 rounded-[2rem] border border-brand-graphite/6 bg-white/92" : "space-y-6"}
      >
        <div>
          {isConsumerMode ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-brand-graphite/55">
                {consumerQuestionCopy.supportingText}
              </p>
              <p className="font-display text-2xl leading-[1.2] text-brand-graphite sm:text-[2.2rem]">
                {currentQuestion.questionText}
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
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
                    className={`w-full text-left transition ${
                      isConsumerMode
                        ? currentAnswer?.answer === i
                          ? "rounded-[1.75rem] border border-[#28577F]/25 bg-[#28577F]/8 p-5 shadow-[0_18px_30px_-26px_rgba(40,87,127,0.45)]"
                          : "rounded-[1.75rem] border border-brand-graphite/10 bg-white/85 p-5 hover:border-[#28577F]/30 hover:bg-[#28577F]/[0.04]"
                        : currentAnswer?.answer === i
                        ? "rounded-xl border border-[#fab826] bg-[#fab826]/10 p-4"
                        : "rounded-xl border border-black/10 bg-white p-4 hover:border-black/20"
                    }`}
                  >
                    {isConsumerMode ? (
                      <div className="flex items-start gap-4">
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 rounded-full border ${
                            currentAnswer?.answer === i
                              ? "border-[#28577F] bg-[#28577F]"
                              : "border-brand-graphite/20 bg-white"
                          }`}
                        >
                          <span className="m-auto h-2 w-2 rounded-full bg-white" />
                        </span>
                        <span className="text-base leading-relaxed text-brand-graphite">{option}</span>
                      </div>
                    ) : (
                      <>
                        <span className="mr-3 font-semibold text-black/40">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span className="text-black">{option}</span>
                      </>
                    )}
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
                  className={`text-center transition ${
                    isConsumerMode
                      ? currentAnswer?.answer === i
                        ? "rounded-[1.75rem] border border-[#28577F]/25 bg-[#28577F]/8 p-6 text-lg font-semibold text-brand-graphite"
                        : "rounded-[1.75rem] border border-brand-graphite/10 bg-white/85 p-6 text-lg font-semibold text-brand-graphite hover:border-[#28577F]/30 hover:bg-[#28577F]/[0.04]"
                      : currentAnswer?.answer === i
                      ? "rounded-xl border border-[#fab826] bg-[#fab826]/10 p-6 text-lg font-semibold"
                      : "rounded-xl border border-black/10 bg-white p-6 text-lg font-semibold hover:border-black/20"
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
          variant={isConsumerMode ? "ghost" : "secondary"}
          size="md"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          {isConsumerMode ? consumerQuestionCopy.previousLabel : "← Previous"}
        </Button>

        {currentIndex === quiz.questions.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Preparing..."
              : isConsumerMode
              ? consumerQuestionCopy.submitLabel
              : "Submit Quiz"}
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={handleNext}>
            {isConsumerMode ? consumerQuestionCopy.nextLabel : "Next →"}
          </Button>
        )}
      </div>

      <div className={`flex flex-wrap justify-center ${isConsumerMode ? "gap-3" : "gap-2"}`}>
        {quiz.questions.map((q, i) => {
          const hasAnswer = answers.some((a) => a.questionId === q.id);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`transition ${
                isConsumerMode
                  ? i === currentIndex
                    ? "h-2.5 w-12 rounded-full bg-[#28577F]"
                    : hasAnswer
                    ? "h-2.5 w-8 rounded-full bg-[#28577F]/45"
                    : "h-2.5 w-8 rounded-full bg-brand-graphite/12 hover:bg-brand-graphite/20"
                  : i === currentIndex
                  ? "h-8 w-8 rounded-lg bg-[#fab826] text-white"
                  : hasAnswer
                  ? "h-8 w-8 rounded-lg bg-green-100 text-green-700"
                  : "h-8 w-8 rounded-lg bg-black/10 text-black/50 hover:bg-black/20"
              }`}
              aria-label={isConsumerMode ? `Go to step ${i + 1}` : `Go to question ${i + 1}`}
            >
              {isConsumerMode ? <span className="sr-only">Step {i + 1}</span> : i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

