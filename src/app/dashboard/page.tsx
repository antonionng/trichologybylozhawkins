import React from "react";
import Link from "next/link";
import { prisma } from "@/server/db/client";
import { requireUserOrRedirect } from "@/server/security/auth";
import { LearnerDashboard } from "@/components/dashboard/LearnerDashboard";
import { listAccessibleCourses } from "@/server/modules/education/access";
import { AdminMetric } from "@/components/admin/AdminMetric";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { StatusBadge } from "@/components/admin/AdminBadge";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const { user } = await requireUserOrRedirect();

  if (user.role === "LEARNER") {
    const courses = await listAccessibleCourses({ userId: user.id });
    return (
      <LearnerDashboard
        user={{
          id: user.id,
          firstName: user.contact?.firstName ?? "Learner",
          lastName: user.contact?.lastName ?? "",
        }}
        courses={courses as any}
      />
    );
  }

  // ADMIN VIEW
  const [contactCount, dealCount, enrollmentCount, pendingTasks, defaultPipeline, tasks, enquiries, recentEnrollments] =
    await Promise.all([
      prisma.contact.count(),
      prisma.deal.count(),
      prisma.enrollment.count(),
      prisma.task.count({ where: { status: "PENDING" } }),
      prisma.dealPipeline.findFirst({
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        include: {
          stages: {
            orderBy: { order: "asc" },
            include: {
              deals: {
                select: { id: true, amount: true, currency: true },
              },
            },
          },
        },
      }),
      prisma.task.findMany({
        where: { status: "PENDING" },
        orderBy: [{ priority: "desc" }, { dueAt: "asc" }, { createdAt: "desc" }],
        take: 5,
        include: { contact: true, deal: true },
      }),
      prisma.courseEnquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { course: true, contact: true },
      }),
      prisma.enrollment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          course: { select: { title: true } },
          contact: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

  const totalRevenue = defaultPipeline?.stages.reduce(
    (acc, stage) => acc + stage.deals.reduce((s, d) => s + Number(d.amount ?? 0), 0),
    0
  ) ?? 0;

  const formatDate = (date?: Date | null) =>
    date ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No date";

  return (
    <div className="space-y-6">
      {/* ── Metrics row ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetric label="Contacts" value={contactCount} />
        <AdminMetric label="Pipeline Value" value={`£${totalRevenue.toLocaleString()}`} />
        <AdminMetric label="Active Learners" value={enrollmentCount} />
        <AdminMetric
          label="Open Tasks"
          value={pendingTasks}
          trend={pendingTasks > 0 ? { value: `${pendingTasks} pending`, positive: false } : undefined}
        />
      </div>

      {/* ── Two-column: Activity + Needs Attention ── */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Recent Activity */}
        <Panel variant="default" padding="none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-admin-text">Recent Activity</h2>
            <span className="text-xs text-admin-text-muted">{recentEnrollments.length + enquiries.length} events</span>
          </div>
          <div className="divide-y divide-admin-border max-h-80 overflow-y-auto">
            {recentEnrollments.map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">
                  E
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-admin-text truncate">
                    <span className="font-medium">{e.contact?.firstName} {e.contact?.lastName}</span>{" "}
                    enrolled in <span className="text-admin-text-secondary">{e.course?.title}</span>
                  </p>
                  <p className="text-xs text-admin-text-muted">{formatDate(e.enrolledAt)}</p>
                </div>
                <Link href={`/dashboard/crm/contacts/${e.contactId}`} className="text-xs text-admin-accent hover:underline shrink-0">
                  View
                </Link>
              </div>
            ))}
            {enquiries.map((eq: any) => (
              <div key={eq.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 text-[10px]">
                  ?
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-admin-text truncate">
                    <span className="font-medium">{eq.name}</span> enquired about{" "}
                    <span className="text-admin-text-secondary">{eq.course?.title ?? "a course"}</span>
                  </p>
                  <p className="text-xs text-admin-text-muted">{formatDate(eq.createdAt)}</p>
                </div>
                <Link href="/dashboard/education/enquiries" className="text-xs text-admin-accent hover:underline shrink-0">
                  Review
                </Link>
              </div>
            ))}
            {recentEnrollments.length === 0 && enquiries.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-admin-text-muted">No recent activity</p>
            )}
          </div>
        </Panel>

        {/* Needs Attention */}
        <Panel variant="default" padding="none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-admin-text">Needs Attention</h2>
            <span className="text-xs text-admin-text-muted">{tasks.length} items</span>
          </div>
          <div className="divide-y divide-admin-border max-h-80 overflow-y-auto">
            {tasks.map((task: any) => {
              const contactId = task.contactId ?? task.contact?.id;
              const row = (
                <>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-[10px]">
                    !
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-admin-text truncate">{task.title}</p>
                    <p className="text-xs text-admin-text-muted">
                      {task.contact ? `${task.contact.firstName} ${task.contact.lastName}` : task.deal?.name ?? "Unassigned"}
                      {" · "}Due {formatDate(task.dueAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={task.priority} />
                  </div>
                </>
              );
              return (
                <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                  {contactId ? (
                    <Link href={`/dashboard/crm/contacts/${contactId}`} className="flex flex-1 items-center gap-3 min-w-0 text-inherit hover:text-admin-accent">
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </div>
              );
            })}
            {enquiries.filter((eq: any) => !eq.repliedAt).slice(0, 3).map((eq: any) => (
              <div key={`enq-${eq.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400 text-[10px]">
                  @
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-admin-text truncate">
                    New enquiry from <span className="font-medium">{eq.name}</span>
                  </p>
                  <p className="text-xs text-admin-text-muted">{eq.email}</p>
                </div>
                <AdminButton href="/dashboard/education/enquiries" variant="ghost" size="sm">
                  Follow up
                </AdminButton>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-admin-text-muted">All clear! Nothing needs immediate attention.</p>
            )}
          </div>
        </Panel>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-admin-text-muted mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "New Course", href: "/dashboard/education/courses/new", icon: "📚" },
            { label: "New Video", href: "/dashboard/education/videos/new", icon: "🎬" },
            { label: "New Contact", href: "/dashboard/crm/contacts/new", icon: "👤" },
            { label: "Create Content", href: "/dashboard/content/new", icon: "✍️" },
            { label: "Send Campaign", href: "/dashboard/email", icon: "📧" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border border-admin-border bg-admin-panel px-4 py-3 text-sm text-admin-text hover:bg-admin-elevated hover:border-admin-border-strong transition-colors"
            >
              <span className="text-lg">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
