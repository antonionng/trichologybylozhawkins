"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses on mount
  useState(() => {
    fetch("/api/education/courses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data.map((c: any) => ({ id: c.id, title: c.title })));
          if (data.length > 0) {
            setCourseId(data[0].id);
          }
        }
      })
      .catch(console.error);
  });

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
        <p className="text-black/60">Start by giving your quiz a title and selecting a course.</p>
      </div>

      <Surface variant="card" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Quiz Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 focus:border-[#fab826] focus:outline-none focus:ring-1 focus:ring-[#fab826]"
              placeholder="e.g. Day 1-4 Assessment"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
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

