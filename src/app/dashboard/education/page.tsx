export const dynamic = "force-dynamic";

import Link from "next/link";
import { getEducationStats, getRecentEnrollments } from "@/app/actions/education";
import { AdminMetric } from "@/components/admin/AdminMetric";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { Panel } from "@/components/admin/Panel";
import { StatusBadge } from "@/components/admin/AdminBadge";

export default async function EducationDashboard() {
  const [stats, enrollments] = await Promise.all([
    getEducationStats(),
    getRecentEnrollments(),
  ]);

  const currency = (amount: unknown) =>
    `£${Number(amount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Education"
        subtitle="Manage courses, videos, quizzes, and conditions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education" },
        ]}
        actions={
          <>
            <AdminButton href="/dashboard/education/courses/new" variant="primary" size="md">
              + New Course
            </AdminButton>
            <AdminButton href="/dashboard/education/videos/new" variant="secondary" size="md">
              + New Video
            </AdminButton>
          </>
        }
      />

      {/* Sub-nav tabs */}
      <div className="flex items-center gap-1 border-b border-admin-border pb-0">
        {[
          { label: "Overview", href: "/dashboard/education", exact: true },
          { label: "Courses", href: "/dashboard/education/courses" },
          { label: "Workshops", href: "/dashboard/education/workshops" },
          { label: "Videos", href: "/dashboard/education/videos" },
          { label: "Quizzes", href: "/dashboard/education/quizzes" },
          { label: "Conditions", href: "/dashboard/education/conditions" },
        ].map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className="relative px-3 py-2 text-sm font-medium text-admin-text-muted hover:text-admin-text-secondary transition-colors"
          >
            {tab.label}
            {tab.exact && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-admin-accent rounded-full" />
            )}
          </Link>
        ))}
      </div>

      {/* Metrics strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetric label="Revenue (All Time)" value={currency(stats.revenueAllTime)} />
        <AdminMetric label="Last 30 Days" value={currency(stats.last30Days.revenue)} />
        <AdminMetric label="Total Courses" value={stats.totals.courses} />
        <AdminMetric label="Active Learners" value={stats.totals.enrollmentsActive} />
      </div>

      {/* Two-column detail */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Recent enrollments */}
        <Panel variant="default" padding="none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-admin-text">Recent Enrollments</h2>
          </div>
          <div className="divide-y divide-admin-border max-h-72 overflow-y-auto">
            {enrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm text-admin-text truncate">
                    <span className="font-medium">{enrollment.contact.firstName} {enrollment.contact.lastName}</span>
                  </p>
                  <p className="text-xs text-admin-text-muted">{enrollment.course.title}</p>
                </div>
                <span className="text-xs text-admin-text-muted shrink-0 ml-3">
                  {enrollment.createdAt.toLocaleDateString()}
                </span>
              </div>
            ))}
            {enrollments.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-admin-text-muted">No enrollments yet.</p>
            )}
          </div>
        </Panel>

        {/* Course snapshot */}
        <Panel variant="default" padding="none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-admin-text">Course Snapshot</h2>
            <AdminButton href="/dashboard/education/courses" variant="ghost" size="sm">
              View all
            </AdminButton>
          </div>
          <div className="divide-y divide-admin-border">
            {stats.topCourses.map((course: any) => (
              <Link
                key={course.id}
                href={`/dashboard/education/courses/${course.id}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-admin-text truncate group-hover:text-admin-accent transition-colors">
                    {course.title}
                  </p>
                  <p className="text-xs text-admin-text-muted">
                    {course._count.enrollments} learners · {course._count.enquiries} enquiries
                  </p>
                </div>
                <StatusBadge status={course.status} />
              </Link>
            ))}
            {stats.topCourses.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-admin-text-muted">No courses yet.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
