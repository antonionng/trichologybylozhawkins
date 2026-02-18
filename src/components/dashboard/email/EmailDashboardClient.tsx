"use client";

import { useState } from "react";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { AdminTable, AdminColumn } from "@/components/admin/AdminTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge, AdminBadge } from "@/components/admin/AdminBadge";
import { AudienceForm } from "@/components/dashboard/email/AudienceForm";
import { CampaignForm } from "@/components/dashboard/email/CampaignForm";
import { AutomationForm } from "@/components/dashboard/email/AutomationForm";

type Audience = { id: string; name: string; _count?: { members: number } };
type Campaign = { id: string; name: string; status: string; scheduledFor: string | Date | null; audience: { name: string } };
type Automation = { id: string; name: string; status: string; triggerType: string; steps: any[] };

const TAB_DEFS: AdminTab[] = [
  { key: "campaigns", label: "Campaigns" },
  { key: "audiences", label: "Audiences" },
  { key: "automations", label: "Automations" },
];

export function EmailDashboardClient({
  audiences,
  campaigns,
  automations,
}: {
  audiences: Audience[];
  campaigns: Campaign[];
  automations: Automation[];
}) {
  const [tab, setTab] = useState("campaigns");
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showAudienceForm, setShowAudienceForm] = useState(false);
  const [showAutomationForm, setShowAutomationForm] = useState(false);

  const campaignColumns: AdminColumn<Campaign>[] = [
    {
      key: "name",
      header: "Campaign",
      sortable: true,
      render: (row) => <span className="text-sm font-medium text-admin-text">{row.name}</span>,
    },
    {
      key: "audience",
      header: "Audience",
      render: (row) => <span className="text-sm text-admin-text-secondary">{row.audience.name}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "scheduled",
      header: "Scheduled",
      render: (row) => (
        <span className="text-xs text-admin-text-muted">
          {row.scheduledFor
            ? new Date(row.scheduledFor).toLocaleString()
            : "Not scheduled"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email"
        subtitle="Campaigns, audiences, and automations"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Email" }]}
        actions={
          <>
            {tab === "campaigns" && (
              <AdminButton variant="primary" size="md" onClick={() => setShowCampaignForm(!showCampaignForm)}>
                {showCampaignForm ? "Close" : "+ New Campaign"}
              </AdminButton>
            )}
            {tab === "audiences" && (
              <AdminButton variant="primary" size="md" onClick={() => setShowAudienceForm(!showAudienceForm)}>
                {showAudienceForm ? "Close" : "+ New Audience"}
              </AdminButton>
            )}
            {tab === "automations" && (
              <AdminButton variant="primary" size="md" onClick={() => setShowAutomationForm(!showAutomationForm)}>
                {showAutomationForm ? "Close" : "+ New Automation"}
              </AdminButton>
            )}
          </>
        }
      />

      <AdminTabs
        tabs={TAB_DEFS.map((t) => ({
          ...t,
          count:
            t.key === "campaigns" ? campaigns.length :
            t.key === "audiences" ? audiences.length :
            automations.length,
        }))}
        activeKey={tab}
        onChange={setTab}
      />

      {/* ── Campaigns ── */}
      {tab === "campaigns" && (
        <div className="space-y-4">
          {showCampaignForm && (
            <Panel variant="elevated" padding="lg" className="space-y-3">
              <h2 className="text-sm font-semibold text-admin-text">New Campaign</h2>
              <CampaignForm audiences={audiences.map((a) => ({ id: a.id, name: a.name }))} />
            </Panel>
          )}
          <AdminTable
            columns={campaignColumns}
            data={campaigns}
            getRowKey={(r) => r.id}
            emptyMessage="No campaigns yet. Create your first one above."
          />
        </div>
      )}

      {/* ── Audiences ── */}
      {tab === "audiences" && (
        <div className="space-y-4">
          {showAudienceForm && (
            <Panel variant="elevated" padding="lg" className="space-y-3">
              <h2 className="text-sm font-semibold text-admin-text">New Audience</h2>
              <AudienceForm />
            </Panel>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((audience) => (
              <Panel key={audience.id} variant="default" padding="md" className="space-y-2">
                <h3 className="text-sm font-semibold text-admin-text">{audience.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-admin-text-muted">
                    {audience._count?.members ?? 0} members
                  </span>
                  <AdminBadge variant="success">Active</AdminBadge>
                </div>
              </Panel>
            ))}
            {audiences.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-admin-text-muted">
                No audiences yet. Create your first one above.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Automations ── */}
      {tab === "automations" && (
        <div className="space-y-4">
          {showAutomationForm && (
            <Panel variant="elevated" padding="lg" className="space-y-3">
              <h2 className="text-sm font-semibold text-admin-text">New Automation</h2>
              <AutomationForm audiences={audiences.map((a) => ({ id: a.id, name: a.name }))} />
            </Panel>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {automations.map((automation) => (
              <Panel key={automation.id} variant="default" padding="md" className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-admin-text">{automation.name}</h3>
                  <StatusBadge status={automation.status} />
                </div>
                <p className="text-xs text-admin-text-muted">
                  {automation.steps.length} steps · Trigger: {automation.triggerType.toLowerCase()}
                </p>
              </Panel>
            ))}
            {automations.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-admin-text-muted">
                No automations yet. Create your first one above.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
