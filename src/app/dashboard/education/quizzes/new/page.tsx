"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

type CourseOption = {
  id: string;
  title: string;
  modules?: Array<{ id: string; title: string; position: number }>;
};

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/education/courses?scope=admin")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(
            data.map((c: CourseOption) => ({
              id: c.id,
              title: c.title,
              modules: (c.modules ?? [])
                .slice()
                .sort((a, b) => a.position - b.position),
            })),
          );
          if (data.length > 0) {
            setCourseId(data[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  const selectedModules = courses.find((c) => c.id === courseId)?.modules ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/education/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          courseId,
          moduleId: moduleId || undefined,
          passingScore: 70,
          status: "DRAFT",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create quiz");
      }

      router.push(`/dashboard/education/quizzes/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/education/quizzes"
          className="mb-2 inline-block text-xs uppercase tracking-[0.2em] text-black/50 hover:text-black"
        >
          ← Back to Quizzes
        </Link>
        <h1 className="font-display text-2xl text-black">Create New Quiz</h1>
        <p className="text-black/60">
          Start as a draft. Attach a course module to surface it as the chair-check on that module&apos;s last lesson.
        </p>
      </div>

      <Surface variant="card" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Quiz Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
              placeholder="e.g. Chair-check: Recognising Common Scalp Concerns"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Course</label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setModuleId("");
              }}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
              required
            >
              <option value="">Select a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">
              Course module (optional chair-check)
            </label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
              disabled={!courseId}
            >
              <option value="">Whole course (not a module chair-check)</option>
              {selectedModules.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-black/50">
              Published module quizzes appear after the last lesson in that module. Keep drafts unpublished until copy is final.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/dashboard/education/quizzes"
              className="rounded-xl border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black/50 hover:text-black"
            >
              Cancel
            </Link>
            <Button type="submit" variant="primary" size="md" disabled={loading}>
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
