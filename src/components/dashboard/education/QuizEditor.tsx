"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminTextarea } from "@/components/admin/AdminTextarea";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { useToast } from "@/components/admin/Toast";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  passingScore: number;
  timeLimit: number | null;
  isRequired: boolean;
  status: string;
  course: { id: string; title: string; slug: string };
  questions: Array<{
    id: string;
    position: number;
    questionText: string;
    questionType: string;
    options: any;
    correctAnswer: any;
    explanation: string | null;
    points: number;
  }>;
  _count: { attempts: number };
};

type Props = {
  quiz: Quiz;
  courses: Array<{ id: string; title: string }>;
};

type TabKey = "settings" | "questions" | "attempts";

const TABS: AdminTab[] = [
  { key: "settings", label: "Settings" },
  { key: "questions", label: "Questions" },
  { key: "attempts", label: "Attempts" },
];

export function QuizEditor({ quiz, courses }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("settings");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: quiz.title,
    description: quiz.description || "",
    courseId: quiz.courseId,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit || "",
    isRequired: quiz.isRequired,
    status: quiz.status,
  });

  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    questionType: "MULTIPLE_CHOICE",
    options: ["", "", "", ""],
    correctAnswer: 0 as number | string,
    explanation: "",
  });

  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");
  const [aiCount, setAiCount] = useState(10);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/education/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, description: form.description || undefined,
          courseId: form.courseId, passingScore: form.passingScore,
          timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
          isRequired: form.isRequired, status: form.status,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to save"); }
      toast("Quiz saved", "success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      toast("Failed to save", "error");
    } finally { setSaving(false); }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/education/quizzes/${quiz.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: newQuestion.questionText, questionType: newQuestion.questionType,
          options: newQuestion.options.filter(Boolean), correctAnswer: newQuestion.correctAnswer,
          explanation: newQuestion.explanation || undefined, position: quiz.questions.length,
        }),
      });
      if (!res.ok) throw new Error("Failed to add question");
      setNewQuestion({ questionText: "", questionType: "MULTIPLE_CHOICE", options: ["", "", "", ""], correctAnswer: 0, explanation: "" });
      toast("Question added", "success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add question");
    } finally { setSaving(false); }
  };

  const generateQuestions = async (mode: "questions" | "full") => {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/ai/quiz-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), difficulty: aiDifficulty, numQuestions: aiCount, mode, titleHint: form.title }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "AI generation failed");

      if (mode === "full" && (json.title || json.description)) {
        const patchRes = await fetch(`/api/education/quizzes/${quiz.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: json.title ?? form.title, description: json.description ?? form.description }),
        });
        if (patchRes.ok) {
          setForm((p) => ({ ...p, title: json.title ?? p.title, description: json.description ?? p.description }));
        }
      }

      const basePos = quiz.questions.length;
      for (let i = 0; i < (json.questions?.length ?? 0); i++) {
        const q = json.questions[i];
        await fetch(`/api/education/quizzes/${quiz.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionText: q.questionText, questionType: String(q.questionType),
            options: q.questionType === "MULTIPLE_CHOICE" ? (Array.isArray(q.options) ? q.options : []) : [],
            correctAnswer: q.correctAnswer, explanation: q.explanation || undefined,
            position: basePos + i, points: typeof q.points === "number" ? q.points : 1,
          }),
        });
      }
      toast(`${json.questions?.length ?? 0} questions generated`, "success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI generation failed");
      toast("AI generation failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={form.title || "Edit Quiz"}
        subtitle={`${quiz.course.title} · ${quiz._count.attempts} attempts`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Quizzes", href: "/dashboard/education/quizzes" },
          { label: form.title || "Edit" },
        ]}
        actions={
          <AdminButton variant="primary" size="md" onClick={handleSave} loading={saving}>
            {saving ? "Saving…" : "Save Quiz"}
          </AdminButton>
        }
      />

      {error && (
        <Panel variant="elevated" padding="sm" className="border-admin-danger/30 text-admin-danger text-sm">
          {error}
        </Panel>
      )}

      <AdminTabs
        tabs={TABS.map((t) => ({
          ...t,
          count: t.key === "questions" ? quiz.questions.length : t.key === "attempts" ? quiz._count.attempts : undefined,
        }))}
        activeKey={tab}
        onChange={(k) => setTab(k as TabKey)}
      />

      {tab === "settings" && (
        <Panel variant="default" padding="lg" className="grid gap-4 lg:grid-cols-2">
          <AdminInput label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <AdminSelect label="Course" value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
            options={courses.map((c) => ({ value: c.id, label: c.title }))} />
          <div className="lg:col-span-2">
            <AdminTextarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          </div>
          <AdminInput label="Passing Score (%)" type="number" min={0} max={100} value={String(form.passingScore)}
            onChange={(e) => setForm((p) => ({ ...p, passingScore: Number(e.target.value) }))} />
          <AdminInput label="Time Limit (mins)" type="number" min={1} value={String(form.timeLimit)}
            onChange={(e) => setForm((p) => ({ ...p, timeLimit: e.target.value }))} placeholder="No limit" />
          <AdminSelect label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            options={[{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" }]} />
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isRequired" checked={form.isRequired}
              onChange={(e) => setForm((p) => ({ ...p, isRequired: e.target.checked }))}
              className="h-4 w-4 rounded border-admin-border-strong bg-admin-elevated text-admin-accent focus:ring-admin-accent/40"
            />
            <label htmlFor="isRequired" className="text-sm text-admin-text-secondary">Required to complete course</label>
          </div>
        </Panel>
      )}

      {tab === "questions" && (
        <div className="space-y-4">
          {/* Add question */}
          <Panel variant="default" padding="lg" className="space-y-4">
            <h2 className="text-sm font-semibold text-admin-text">Add Question</h2>
            <AdminTextarea label="Question Text" value={newQuestion.questionText}
              onChange={(e) => setNewQuestion((p) => ({ ...p, questionText: e.target.value }))} rows={3} placeholder="Enter your question…" />
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminSelect label="Question Type" value={newQuestion.questionType}
                onChange={(e) => setNewQuestion((p) => ({ ...p, questionType: e.target.value }))}
                options={[
                  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
                  { value: "TRUE_FALSE", label: "True / False" },
                  { value: "SHORT_ANSWER", label: "Short Answer" },
                ]}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-admin-text-secondary">Correct Answer</label>
                {newQuestion.questionType === "MULTIPLE_CHOICE" ? (
                  <select value={String(newQuestion.correctAnswer)}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, correctAnswer: Number(e.target.value) }))}
                    className="block w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-accent/40"
                  >
                    {newQuestion.options.map((_, i) => <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>)}
                  </select>
                ) : newQuestion.questionType === "TRUE_FALSE" ? (
                  <select value={String(newQuestion.correctAnswer)}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, correctAnswer: e.target.value === "0" ? 0 : 1 }))}
                    className="block w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-accent/40"
                  >
                    <option value="0">True</option>
                    <option value="1">False</option>
                  </select>
                ) : (
                  <AdminInput value={String(newQuestion.correctAnswer ?? "")}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, correctAnswer: e.target.value }))}
                    placeholder="Correct answer" />
                )}
              </div>
            </div>
            {newQuestion.questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-admin-text-secondary">Options</label>
                <div className="grid gap-2 lg:grid-cols-2">
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-admin-text-muted">{String.fromCharCode(65 + i)}.</span>
                      <AdminInput value={opt}
                        onChange={(e) => {
                          const newOpts = [...newQuestion.options];
                          newOpts[i] = e.target.value;
                          setNewQuestion((p) => ({ ...p, options: newOpts }));
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <AdminButton variant="secondary" size="md" onClick={handleAddQuestion} disabled={saving}>
              Add Question
            </AdminButton>
          </Panel>

          {/* AI generation */}
          <Panel variant="default" padding="lg" className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-admin-text">AI Question Generator</h2>
              <p className="text-xs text-admin-text-muted mt-0.5">Generate questions automatically. Review before publishing.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AdminInput label="Topic" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Scalp inflammation, consultation workflow…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <AdminSelect label="Difficulty" value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value as any)}
                  options={[
                    { value: "BEGINNER", label: "Beginner" },
                    { value: "INTERMEDIATE", label: "Intermediate" },
                    { value: "ADVANCED", label: "Advanced" },
                  ]} />
                <AdminInput label="Count" type="number" min={3} max={25} value={String(aiCount)}
                  onChange={(e) => setAiCount(Number(e.target.value))} />
              </div>
            </div>
            <div className="flex gap-2">
              <AdminButton variant="secondary" size="md" disabled={saving || !aiTopic.trim()}
                onClick={() => generateQuestions("questions")}>Generate questions</AdminButton>
              <AdminButton variant="ghost" size="md" disabled={saving || !aiTopic.trim()}
                onClick={() => generateQuestions("full")}>Generate full quiz</AdminButton>
            </div>
          </Panel>

          {/* Existing questions */}
          <Panel variant="default" padding="lg" className="space-y-4">
            <h2 className="text-sm font-semibold text-admin-text">
              {quiz.questions.length} Question{quiz.questions.length !== 1 ? "s" : ""}
            </h2>
            <div className="space-y-2">
              {quiz.questions.map((q, index) => (
                <div key={q.id} className="rounded-lg border border-admin-border bg-admin-elevated p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-admin-text-muted">Q{index + 1}.</span>
                        <AdminBadge variant={q.questionType === "MULTIPLE_CHOICE" ? "info" : q.questionType === "TRUE_FALSE" ? "accent" : "default"}>
                          {q.questionType.replace("_", " ")}
                        </AdminBadge>
                      </div>
                      <p className="mt-1.5 text-sm text-admin-text">{q.questionText}</p>
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {(q.options as string[]).map((opt, i) => (
                            <p key={i} className={`text-xs ${q.correctAnswer === i ? "font-medium text-emerald-400" : "text-admin-text-muted"}`}>
                              {String.fromCharCode(65 + i)}. {opt}{q.correctAnswer === i ? " ✓" : ""}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-admin-text-muted shrink-0">{q.points} pt</span>
                  </div>
                </div>
              ))}
              {quiz.questions.length === 0 && (
                <p className="py-8 text-center text-xs text-admin-text-muted">No questions yet. Add your first question above.</p>
              )}
            </div>
          </Panel>
        </div>
      )}

      {tab === "attempts" && (
        <Panel variant="default" padding="lg">
          <h2 className="text-sm font-semibold text-admin-text">
            {quiz._count.attempts} Attempt{quiz._count.attempts !== 1 ? "s" : ""}
          </h2>
          {quiz._count.attempts === 0 ? (
            <p className="py-8 text-center text-xs text-admin-text-muted">
              No attempts yet. Publish the quiz to allow students to take it.
            </p>
          ) : (
            <p className="mt-2 text-xs text-admin-text-muted">
              Attempt history with scores and timestamps will appear here.
            </p>
          )}
        </Panel>
      )}
    </div>
  );
}
