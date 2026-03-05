import Link from "next/link";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

interface Course {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  level: string;
  enrollmentType: string;
  heroMedia?: { path: string } | null;
}

interface LearnerDashboardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  courses: Course[];
}

export function LearnerDashboard({ user, courses }: LearnerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome / continue card */}
      <Panel variant="elevated" padding="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-admin-accent/5 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wider text-admin-text-muted">
            Welcome back, {user.firstName}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-admin-text">My Learning Dashboard</h1>
          {courses.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <AdminButton variant="primary" size="lg" href={`/academy/${courses[0].id}`}>
                Continue learning: {courses[0].title}
              </AdminButton>
            </div>
          )}
        </div>
      </Panel>

      {/* Course cards */}
      {courses.length > 0 ? (
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-admin-text-muted mb-3">
            My Courses ({courses.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Panel key={course.id} variant="default" padding="none" className="group flex flex-col">
                <div className="p-4 flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-admin-text-muted">
                      {course.level}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-admin-accent/70">
                      {course.enrollmentType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-admin-text group-hover:text-admin-accent transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-admin-text-secondary line-clamp-2">
                    {course.subtitle ?? course.description ?? "Access your course materials and lessons."}
                  </p>

                  <div className="pt-2">
                    <p className="text-[11px] text-admin-text-muted">
                      Open this course to continue lessons and track completion.
                    </p>
                  </div>
                </div>
                <div className="border-t border-admin-border px-4 py-2.5 flex items-center justify-end">
                  <AdminButton href={`/academy/${course.id}`} variant="ghost" size="sm">
                    Resume →
                  </AdminButton>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      ) : (
        <AdminEmptyState
          title="Ready to start your journey?"
          description="You haven't enrolled in any courses yet. Explore our education catalog to find the right program for you."
          action={
            <AdminButton variant="primary" size="lg" href="/education">
              Browse Courses
            </AdminButton>
          }
        />
      )}

      {/* Support row */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Panel variant="default" padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold text-admin-text">Learning Path</h3>
          <p className="text-xs text-admin-text-secondary">
            Follow your structured curriculum and track your progress through trichology fundamentals and clinical practice.
          </p>
          <div className="rounded-md border border-admin-border bg-admin-elevated p-3 text-xs text-admin-text-secondary">
            <p>
              You currently have <span className="font-semibold text-admin-text">{courses.length}</span>{" "}
              active {courses.length === 1 ? "course" : "courses"}.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <AdminButton href="/academy" variant="ghost" size="sm">
                Open Academy
              </AdminButton>
              <AdminButton href="/education" variant="ghost" size="sm">
                Explore more courses
              </AdminButton>
            </div>
          </div>
        </Panel>
        <Panel variant="default" padding="md" className="space-y-3">
          <h3 className="text-sm font-semibold text-admin-text">Support & Resources</h3>
          <p className="text-xs text-admin-text-secondary">
            Need help? Access our Knowledge Hub or contact Lorraine directly for guidance on your studies.
          </p>
          <div className="flex items-center gap-3">
            <AdminButton href="/blog" variant="ghost" size="sm">
              Knowledge Hub
            </AdminButton>
            <AdminButton href="/contact" variant="ghost" size="sm">
              Contact Support
            </AdminButton>
          </div>
        </Panel>
      </div>
    </div>
  );
}
