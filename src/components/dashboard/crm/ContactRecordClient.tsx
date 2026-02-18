"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/admin/Panel";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminTextarea } from "@/components/admin/AdminTextarea";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminBadge, StatusBadge } from "@/components/admin/AdminBadge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useToast } from "@/components/admin/Toast";
import { ContactUpsertForm } from "@/components/dashboard/crm/ContactUpsertForm";

type Activity = { id: string; type: string; subject: string; body: string | null; outcome: string | null; activityAt: string | Date };
type Deal = { id: string; name: string; stage?: { name: string } | null };
type Task = { id: string; title: string; status: string; dueAt: string | Date | null };

type ContactRecord = {
  id: string; firstName: string; lastName: string; email: string;
  phone: string | null; jobTitle: string | null; source: string | null;
  ownerId: string | null; lifecycleStage: string; notes?: string | null;
  companyId: string | null; company: { id: string; name: string } | null;
  createdAt: string | Date;
  deals: Deal[]; tasks: Task[]; activities: Activity[];
  courseEnquiries: { id: string; createdAt: string | Date; status: string; email: string; name: string }[];
  orders: { id: string; createdAt: string | Date; status: string; totalAmount: unknown; currency: string }[];
  enrollments: { id: string; createdAt: string | Date; status: string; course: { title: string } }[];
  emailSends: { id: string; createdAt: string | Date; status: string; email: string; campaign: { name: string } }[];
  chatConversations: { id: string; updatedAt: string | Date; title: string | null; status: string }[];
  quizAttempts: Array<{
    id: string; createdAt: string | Date; percentage: number; score: number; maxScore: number;
    passed: boolean; aiFeedback: any | null; quiz: { id: string; title: string; slug: string | null };
  }>;
};

type TabKey = "overview" | "activity" | "related";

const ACTIVITY_TYPES = ["CALL", "EMAIL", "MEETING", "NOTE", "OTHER"] as const;
const TAB_DEFS: AdminTab[] = [
  { key: "overview", label: "Overview" },
  { key: "activity", label: "Activity" },
  { key: "related", label: "Related" },
];

function fmtDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

async function logActivity(input: { type: string; subject: string; body?: string; contactId: string }) {
  const res = await fetch("/api/crm/activities", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? "Failed to log activity");
  return json as Activity;
}

export function ContactRecordClient({ initialContact }: { initialContact: ContactRecord }) {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("overview");
  const [activities, setActivities] = useState<Activity[]>(initialContact.activities ?? []);
  const [composer, setComposer] = useState({ type: "NOTE", subject: "", body: "" });
  const [logging, setLogging] = useState(false);

  const editInitial = useMemo(() => ({
    id: initialContact.id, firstName: initialContact.firstName, lastName: initialContact.lastName,
    email: initialContact.email, phone: initialContact.phone ?? "", jobTitle: initialContact.jobTitle ?? "",
    source: initialContact.source ?? "", ownerId: initialContact.ownerId ?? "",
    lifecycleStage: initialContact.lifecycleStage, notes: initialContact.notes ?? "",
    companyId: initialContact.companyId ?? "",
  }), [initialContact]);

  const onLog = async () => {
    setLogging(true);
    try {
      const created = await logActivity({ type: composer.type, subject: composer.subject.trim(), body: composer.body.trim() || undefined, contactId: initialContact.id });
      setActivities((prev) => [created, ...prev]);
      setComposer({ type: composer.type, subject: "", body: "" });
      toast("Activity logged", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally { setLogging(false); }
  };

  function RelatedSection({ title, count, items, renderItem, linkHref, linkLabel }: {
    title: string; count: number; items: any[]; renderItem: (item: any) => React.ReactNode;
    linkHref?: string; linkLabel?: string;
  }) {
    return (
      <Panel variant="default" padding="none">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-admin-border">
          <h3 className="text-xs font-semibold text-admin-text-secondary">{title} ({count})</h3>
          {linkHref && <AdminButton href={linkHref} variant="ghost" size="sm">{linkLabel}</AdminButton>}
        </div>
        <div className="divide-y divide-admin-border">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-admin-text-muted">None yet.</p>
          ) : items.slice(0, 5).map(renderItem)}
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title={`${initialContact.firstName} ${initialContact.lastName}`}
        subtitle={initialContact.email}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "CRM", href: "/dashboard/crm" },
          { label: "Contacts", href: "/dashboard/crm/contacts" },
          { label: `${initialContact.firstName} ${initialContact.lastName}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <AdminBadge variant="accent">{initialContact.lifecycleStage.replace(/_/g, " ")}</AdminBadge>
          </div>
        }
      />

      <AdminTabs tabs={TAB_DEFS} activeKey={tab} onChange={(k) => setTab(k as TabKey)} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {tab === "overview" && (
            <>
              <Panel variant="default" padding="lg">
                <ContactUpsertForm mode="edit" initial={editInitial} />
              </Panel>

              {/* Quiz attempts */}
              {(initialContact.quizAttempts ?? []).length > 0 && (
                <Panel variant="default" padding="none">
                  <div className="px-4 py-3 border-b border-admin-border">
                    <h2 className="text-sm font-semibold text-admin-text">Quiz Attempts</h2>
                  </div>
                  <div className="divide-y divide-admin-border">
                    {initialContact.quizAttempts.map((a) => (
                      <div key={a.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-admin-text-muted">{a.quiz.title}</p>
                            <p className="text-sm font-medium text-admin-text mt-0.5">
                              {Math.round(a.percentage)}% · {a.score}/{a.maxScore}
                            </p>
                          </div>
                          <StatusBadge status={a.passed ? "PASSED" : "FAILED"} />
                        </div>
                        {a.aiFeedback?.summary && (
                          <p className="mt-2 text-xs text-admin-text-secondary line-clamp-2">
                            {a.aiFeedback.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </>
          )}

          {tab === "activity" && (
            <>
              <Panel variant="default" padding="lg" className="space-y-4">
                <h2 className="text-sm font-semibold text-admin-text">Log Activity</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <AdminSelect label="Type" value={composer.type}
                    onChange={(e) => setComposer((p) => ({ ...p, type: e.target.value }))}
                    options={ACTIVITY_TYPES.map((t) => ({ value: t, label: t }))} />
                  <div className="md:col-span-2">
                    <AdminInput label="Subject" value={composer.subject}
                      onChange={(e) => setComposer((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. Follow-up call, Consult booked…" />
                  </div>
                </div>
                <AdminTextarea label="Details (optional)" value={composer.body}
                  onChange={(e) => setComposer((p) => ({ ...p, body: e.target.value }))} rows={3} />
                <div className="flex justify-end">
                  <AdminButton variant="primary" size="md" onClick={onLog}
                    disabled={logging || !composer.subject.trim()} loading={logging}>
                    Log activity
                  </AdminButton>
                </div>
              </Panel>

              <Panel variant="default" padding="none">
                <div className="px-4 py-3 border-b border-admin-border">
                  <h2 className="text-sm font-semibold text-admin-text">Timeline</h2>
                </div>
                <div className="divide-y divide-admin-border">
                  {activities.map((a) => (
                    <div key={a.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <AdminBadge variant="accent">{a.type}</AdminBadge>
                          <p className="text-sm font-medium text-admin-text mt-1">{a.subject}</p>
                          {a.body && <p className="text-xs text-admin-text-secondary mt-1">{a.body}</p>}
                        </div>
                        <span className="text-[10px] text-admin-text-muted shrink-0">{fmtDate(a.activityAt)}</span>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="px-4 py-8 text-center text-xs text-admin-text-muted">
                      No activity logged yet.
                    </p>
                  )}
                </div>
              </Panel>
            </>
          )}

          {tab === "related" && (
            <div className="grid gap-3 lg:grid-cols-2">
              <RelatedSection title="Deals" count={initialContact.deals.length} items={initialContact.deals}
                linkHref="/dashboard/crm" linkLabel="View CRM"
                renderItem={(d) => (
                  <div key={d.id} className="px-4 py-2.5">
                    <p className="text-sm font-medium text-admin-text">{d.name}</p>
                    <p className="text-xs text-admin-text-muted">{d.stage?.name ?? "—"}</p>
                  </div>
                )} />
              <RelatedSection title="Tasks" count={initialContact.tasks.length} items={initialContact.tasks}
                renderItem={(t) => (
                  <div key={t.id} className="px-4 py-2.5">
                    <p className="text-sm text-admin-text">{t.title}</p>
                    <p className="text-xs text-admin-text-muted">{t.status}{t.dueAt ? ` · ${fmtDate(t.dueAt)}` : ""}</p>
                  </div>
                )} />
              <RelatedSection title="Enrollments" count={initialContact.enrollments.length} items={initialContact.enrollments}
                linkHref="/dashboard/education" linkLabel="Education"
                renderItem={(en) => (
                  <div key={en.id} className="px-4 py-2.5">
                    <p className="text-sm text-admin-text">{en.course.title}</p>
                    <p className="text-xs text-admin-text-muted">{en.status} · {fmtDate(en.createdAt)}</p>
                  </div>
                )} />
              <RelatedSection title="Orders" count={initialContact.orders.length} items={initialContact.orders}
                renderItem={(o) => (
                  <div key={o.id} className="px-4 py-2.5">
                    <p className="text-sm text-admin-text">{o.status}</p>
                    <p className="text-xs text-admin-text-muted">{fmtDate(o.createdAt)} · {o.currency}</p>
                  </div>
                )} />
              <RelatedSection title="Enquiries" count={initialContact.courseEnquiries.length} items={initialContact.courseEnquiries}
                renderItem={(e) => (
                  <div key={e.id} className="px-4 py-2.5">
                    <p className="text-sm text-admin-text">{e.name}</p>
                    <p className="text-xs text-admin-text-muted">{e.status} · {fmtDate(e.createdAt)}</p>
                  </div>
                )} />
              <RelatedSection title="Email" count={initialContact.emailSends.length} items={initialContact.emailSends}
                linkHref="/dashboard/email" linkLabel="Email"
                renderItem={(s) => (
                  <div key={s.id} className="px-4 py-2.5">
                    <p className="text-sm text-admin-text">{s.campaign.name}</p>
                    <p className="text-xs text-admin-text-muted">{s.status} · {fmtDate(s.createdAt)}</p>
                  </div>
                )} />
            </div>
          )}
        </div>

        {/* Right sidebar - profile at-a-glance */}
        <div className="space-y-3">
          <Panel variant="elevated" padding="md" className="space-y-3">
            <h3 className="text-xs font-medium text-admin-text-muted uppercase tracking-wider">Profile</h3>
            <div className="space-y-2">
              <div className="rounded-md border border-admin-border bg-admin-panel p-3">
                <p className="text-[10px] text-admin-text-muted uppercase tracking-wider">Lifecycle</p>
                <p className="text-sm font-medium text-admin-accent mt-0.5">{initialContact.lifecycleStage.replace(/_/g, " ")}</p>
              </div>
              <div className="rounded-md border border-admin-border bg-admin-panel p-3">
                <p className="text-[10px] text-admin-text-muted uppercase tracking-wider">Company</p>
                <p className="text-sm font-medium text-admin-text mt-0.5">{initialContact.company?.name ?? "—"}</p>
              </div>
              <div className="rounded-md border border-admin-border bg-admin-panel p-3">
                <p className="text-[10px] text-admin-text-muted uppercase tracking-wider">Email</p>
                <a href={`mailto:${initialContact.email}`} className="text-sm text-admin-accent hover:underline mt-0.5 block truncate">
                  {initialContact.email}
                </a>
              </div>
              <div className="rounded-md border border-admin-border bg-admin-panel p-3">
                <p className="text-[10px] text-admin-text-muted uppercase tracking-wider">Phone</p>
                <p className="text-sm text-admin-text mt-0.5">{initialContact.phone ?? "—"}</p>
              </div>
              <div className="rounded-md border border-admin-border bg-admin-panel p-3">
                <p className="text-[10px] text-admin-text-muted uppercase tracking-wider">Job Title</p>
                <p className="text-sm text-admin-text mt-0.5">{initialContact.jobTitle ?? "—"}</p>
              </div>
              {initialContact.source && (
                <div className="rounded-md border border-admin-border bg-admin-panel p-3">
                  <p className="text-[10px] text-admin-text-muted uppercase tracking-wider">Source</p>
                  <p className="text-sm text-admin-text mt-0.5">{initialContact.source}</p>
                </div>
              )}
              <div className="rounded-md border border-admin-border bg-admin-panel p-3">
                <p className="text-[10px] text-admin-text-muted uppercase tracking-wider">Created</p>
                <p className="text-sm text-admin-text-secondary mt-0.5">{fmtDate(initialContact.createdAt)}</p>
              </div>
            </div>
          </Panel>

          {initialContact.notes && (
            <Panel variant="elevated" padding="md" className="space-y-2">
              <h3 className="text-xs font-medium text-admin-text-muted uppercase tracking-wider">Notes</h3>
              <p className="text-xs text-admin-text-secondary leading-relaxed line-clamp-4">
                {initialContact.notes}
              </p>
            </Panel>
          )}

          <Panel variant="elevated" padding="md" className="space-y-2">
            <h3 className="text-xs font-medium text-admin-text-muted uppercase tracking-wider">Quick Actions</h3>
            <div className="flex flex-col gap-1.5">
              <AdminButton variant="secondary" size="sm" onClick={() => { setTab("activity"); }}>
                Log Activity
              </AdminButton>
              <AdminButton variant="secondary" size="sm" href="/dashboard/crm">
                View Pipeline
              </AdminButton>
              <AdminButton variant="secondary" size="sm" href={`mailto:${initialContact.email}`}>
                Send Email
              </AdminButton>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
