"use client";

import { useState } from "react";
import Image from "next/image";
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
  isPublic: boolean;
  isFeaturedLead: boolean;
  slug: string | null;
  cardImageUrl?: string | null;
  heroMedia?: { id: string; path: string } | null;
  recommendedCourseId?: string | null;
  course: { id: string; title: string; slug: string };
  recommendedCourse?: { id: string; title: string } | null;
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
  /** Resolved preview URL (signed storage or external) */
  heroUrl?: string | null;
};

type TabKey = "settings" | "media" | "questions" | "attempts";

const TABS: AdminTab[] = [
  { key: "settings", label: "Settings" },
  { key: "media", label: "Card image" },
  { key: "questions", label: "Questions" },
  { key: "attempts", label: "Attempts" },
];

export function QuizEditor({ quiz, courses, heroUrl }: Props) {
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
    isPublic: quiz.isPublic,
    isFeaturedLead: quiz.isFeaturedLead,
    slug: quiz.slug || "",
    cardImageUrl: quiz.cardImageUrl || "",
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
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const trimmedUrl = form.cardImageUrl.trim();
      const res = await fetch(`/api/education/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, description: form.description || undefined,
          courseId: form.courseId, passingScore: form.passingScore,
          timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
          isRequired: form.isRequired, status: form.status,
          isPublic: form.isPublic,
          isFeaturedLead: form.isFeaturedLead,
          slug: form.slug.trim() || undefined,
          cardImageUrl: trimmedUrl || null,
          ...(trimmedUrl ? { heroMediaId: null } : {}),
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

  const uploadHero = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const prepRes = await fetch("/api/media/prepare-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "quiz-hero",
          quizId: quiz.id,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });
      const prepJson = await prepRes.json();
      if (!prepRes.ok) throw new Error(prepJson?.error ?? "Failed to prepare upload");

      const uploadRes = await fetch(prepJson.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) {
        const text = await uploadRes.text().catch(() => "");
        throw new Error(text || `Upload failed (${uploadRes.status})`);
      }

      const confirmRes = await fetch("/api/media/confirm-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "quiz-hero",
          quizId: quiz.id,
          storagePath: prepJson.storagePath,
          contentType: file.type || "application/octet-stream",
          title: `Quiz: ${quiz.title}`,
          sizeBytes: file.size,
        }),
      });
      const confirmJson = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmJson?.error ?? "Failed to save upload");
      setForm((p) => ({ ...p, cardImageUrl: "" }));
      toast("Card image uploaded", "success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const clearCardImage = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/education/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroMediaId: null, cardImageUrl: null }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to clear");
      }
      setForm((p) => ({ ...p, cardImageUrl: "" }));
      toast("Card image removed", "success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear");
      toast("Failed to remove image", "error");
    } finally {
      setSaving(false);
    }
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
          <AdminInput
            label="Public quiz slug"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder="scalp-health-check"
          />
          <AdminInput label="Passing Score (%)" type="number" min={0} max={100} value={String(form.passingScore)}
            onChange={(e) => setForm((p) => ({ ...p, passingScore: Number(e.target.value) }))} />
          <AdminInput label="Time Limit (mins)" type="number" min={1} value={String(form.timeLimit)}
            onChange={(e) => setForm((p) => ({ ...p, timeLimit: e.target.value }))} placeholder="No limit" />
          <AdminSelect label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            options={[{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" }]} />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={form.isPublic}
              onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
              className="h-4 w-4 rounded border-admin-border-strong bg-admin-elevated text-admin-accent focus:ring-admin-accent/40"
            />
            <label htmlFor="isPublic" className="text-sm text-admin-text-secondary">Public quiz</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeaturedLead"
              checked={form.isFeaturedLead}
              onChange={(e) => setForm((p) => ({ ...p, isFeaturedLead: e.target.checked }))}
              className="h-4 w-4 rounded border-admin-border-strong bg-admin-elevated text-admin-accent focus:ring-admin-accent/40"
            />
            <label htmlFor="isFeaturedLead" className="text-sm text-admin-text-secondary">
              Featured lead quiz
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isRequired" checked={form.isRequired}
              onChange={(e) => setForm((p) => ({ ...p, isRequired: e.target.checked }))}
              className="h-4 w-4 rounded border-admin-border-strong bg-admin-elevated text-admin-accent focus:ring-admin-accent/40"
            />
            <label htmlFor="isRequired" className="text-sm text-admin-text-secondary">Required to complete course</label>
          </div>
        </Panel>
      )}

      {tab === "media" && (
        <Panel variant="default" padding="lg" className="space-y-5 max-w-2xl">
          <div>
            <h2 className="text-sm font-semibold text-admin-text">Quiz card image</h2>
            <p className="mt-1 text-xs text-admin-text-muted">
              Shown on academy quiz cards, public quiz pages, and the admin list. Upload to Supabase or paste an external image URL (e.g. CDN). External URL replaces an uploaded image when you save.
            </p>
          </div>
          {heroUrl ? (
            <div className="relative h-44 w-full overflow-hidden rounded-lg border border-admin-border bg-admin-elevated">
              <Image src={heroUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 448px" />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-admin-border text-sm text-admin-text-muted">
              No card image yet
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-admin-text-secondary">Upload image</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              className="block w-full text-sm text-admin-text file:mr-3 file:rounded-md file:border-0 file:bg-admin-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void uploadHero(f);
              }}
            />
            {uploading ? <p className="text-xs text-admin-text-muted">Uploading…</p> : null}
          </div>
          <AdminInput
            label="External image URL"
            value={form.cardImageUrl}
            onChange={(e) => setForm((p) => ({ ...p, cardImageUrl: e.target.value }))}
            placeholder="https://…"
          />
          <div className="flex flex-wrap gap-2">
            <AdminButton type="button" variant="secondary" size="sm" onClick={handleSave} loading={saving} disabled={uploading}>
              Save URL
            </AdminButton>
            <AdminButton type="button" variant="ghost" size="sm" onClick={() => void clearCardImage()} loading={saving} disabled={uploading}>
              Remove image
            </AdminButton>
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
