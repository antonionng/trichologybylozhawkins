export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/server/db/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminMetric } from "@/components/admin/AdminMetric";
import { Panel } from "@/components/admin/Panel";
import { StatusBadge } from "@/components/admin/AdminBadge";

async function getConditions() {
  return prisma.conditionReference.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export default async function ConditionsPage() {
  const conditions = await getConditions();

  const grouped: Record<string, typeof conditions> = {};
  for (const condition of conditions) {
    const category = condition.category || "Other";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(condition);
  }
  const categories = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Condition Reference Library"
        subtitle="Manage hair and scalp condition reference cards"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Conditions" },
        ]}
        actions={
          <AdminButton href="/dashboard/education/conditions/new" variant="primary" size="md">
            + New Condition
          </AdminButton>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetric label="Total" value={conditions.length} />
        <AdminMetric label="Published" value={conditions.filter((c) => c.status === "PUBLISHED").length} />
        <AdminMetric label="Categories" value={categories.length} />
        <AdminMetric label="Draft" value={conditions.filter((c) => c.status === "DRAFT").length} />
      </div>

      {categories.map((category) => (
        <Panel key={category} variant="default" padding="none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
            <h2 className="text-sm font-semibold text-admin-text">{category}</h2>
            <span className="text-xs text-admin-text-muted">{grouped[category].length} conditions</span>
          </div>
          <div className="grid gap-px bg-admin-border sm:grid-cols-2">
            {grouped[category].map((condition) => (
              <Link
                key={condition.id}
                href={`/dashboard/education/conditions/${condition.id}`}
                className="group flex items-start justify-between gap-3 bg-admin-panel p-4 hover:bg-admin-elevated transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-admin-text group-hover:text-admin-accent transition-colors truncate">
                      {condition.name}
                    </h3>
                    <StatusBadge status={condition.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-admin-text-muted line-clamp-1">
                    {condition.description || "No description"}
                  </p>
                </div>
                <span className="text-admin-text-muted group-hover:text-admin-accent shrink-0 mt-0.5">→</span>
              </Link>
            ))}
          </div>
        </Panel>
      ))}

      {conditions.length === 0 && (
        <Panel variant="default" padding="lg">
          <div className="py-12 text-center">
            <p className="text-sm text-admin-text-secondary">No conditions yet.</p>
            <p className="mt-1 text-xs text-admin-text-muted">Create your first condition reference card.</p>
          </div>
        </Panel>
      )}
    </div>
  );
}
