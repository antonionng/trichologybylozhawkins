import { prisma } from "@/server/db/client";
import { requireUserOrRedirect } from "@/server/security/auth";
import { Panel } from "@/components/admin/Panel";
import { InviteAdminForm } from "@/components/dashboard/settings/InviteAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminTeamSettingsPage() {
  await requireUserOrRedirect({ role: "ADMIN", next: "/dashboard/settings/admins" });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      createdAt: true,
      lastLoginAt: true,
      passwordHash: true,
    },
  });

  return (
    <div className="space-y-6">
      <Panel variant="elevated" padding="lg" className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-admin-text-muted">Settings</p>
        <h1 className="text-2xl font-semibold text-admin-text">Admin team</h1>
        <p className="text-sm text-admin-text-secondary">
          Invite colleagues by email. They receive a one-time link to choose a password and open the dashboard.
        </p>
      </Panel>

      <Panel variant="elevated" padding="lg" className="space-y-4">
        <h2 className="text-sm font-semibold text-admin-text">Invite an admin</h2>
        <InviteAdminForm />
        <p className="text-xs text-admin-text-muted">
          Invites expire after 7 days. You cannot use an address that already belongs to a learner account.
        </p>
      </Panel>

      <Panel variant="elevated" padding="lg" className="space-y-4">
        <h2 className="text-sm font-semibold text-admin-text">Administrators</h2>
        <div className="overflow-x-auto rounded-lg border border-admin-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-admin-border bg-admin-bg">
              <tr>
                <th className="px-3 py-2 font-medium text-admin-text-secondary">Email</th>
                <th className="px-3 py-2 font-medium text-admin-text-secondary">Status</th>
                <th className="px-3 py-2 font-medium text-admin-text-secondary">Added</th>
                <th className="px-3 py-2 font-medium text-admin-text-secondary">Last sign in</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((row) => {
                const active = Boolean(row.passwordHash);
                return (
                  <tr key={row.id} className="border-b border-admin-border/80 last:border-0">
                    <td className="px-3 py-2.5 text-admin-text">{row.email}</td>
                    <td className="px-3 py-2.5 text-admin-text-secondary">
                      {active ? "Active" : "Pending invite"}
                    </td>
                    <td className="px-3 py-2.5 text-admin-text-secondary">
                      {row.createdAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-admin-text-secondary">
                      {row.lastLoginAt
                        ? row.lastLoginAt.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
