import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.fn();

vi.mock("@/server/security/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/server/modules/crm/service", () => ({
  listContacts: vi.fn(),
  upsertContact: vi.fn(),
  getContactById: vi.fn(),
  updateContact: vi.fn(),
  listActivities: vi.fn(),
  logActivity: vi.fn(),
  upsertDeal: vi.fn(),
  bulkUpdateTasks: vi.fn(),
  upsertTask: vi.fn(),
}));

vi.mock("@/server/modules/email/service", () => ({
  listAudiences: vi.fn(),
  upsertAudience: vi.fn(),
  upsertAudienceMember: vi.fn(),
  upsertEmailCampaign: vi.fn(),
  scheduleCampaignSend: vi.fn(),
  upsertAutomation: vi.fn(),
  triggerAutomation: vi.fn(),
}));

vi.mock("@/server/modules/cms/service", () => ({
  listEntries: vi.fn(),
  upsertEntry: vi.fn(),
  listCollections: vi.fn(),
  upsertCollection: vi.fn(),
  registerMediaAsset: vi.fn(),
}));

vi.mock("@/server/modules/contentFactory/service", () => ({
  listExportableContent: vi.fn(),
  upsertContentSlot: vi.fn(),
  rescheduleContentSlot: vi.fn(),
}));

vi.mock("@/server/modules/ai/service", () => ({
  queueContentGeneration: vi.fn(),
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    contentSlot: {
      findUnique: vi.fn(),
    },
  },
}));

type RouteCase = {
  label: string;
  importPath: string;
  handler: "GET" | "POST" | "PATCH";
  request: Request;
  context?: unknown;
};

const routeCases: RouteCase[] = [
  {
    label: "GET /api/crm/contacts",
    importPath: "@/app/api/crm/contacts/route",
    handler: "GET",
    request: new Request("http://localhost/api/crm/contacts"),
  },
  {
    label: "POST /api/crm/contacts",
    importPath: "@/app/api/crm/contacts/route",
    handler: "POST",
    request: new Request("http://localhost/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Ada" }),
    }),
  },
  {
    label: "GET /api/crm/contacts/[id]",
    importPath: "@/app/api/crm/contacts/[id]/route",
    handler: "GET",
    request: new Request("http://localhost/api/crm/contacts/c1"),
    context: { params: { id: "c1" } },
  },
  {
    label: "PATCH /api/crm/contacts/[id]",
    importPath: "@/app/api/crm/contacts/[id]/route",
    handler: "PATCH",
    request: new Request("http://localhost/api/crm/contacts/c1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Ada" }),
    }),
    context: { params: { id: "c1" } },
  },
  {
    label: "GET /api/crm/activities",
    importPath: "@/app/api/crm/activities/route",
    handler: "GET",
    request: new Request("http://localhost/api/crm/activities"),
  },
  {
    label: "POST /api/crm/activities",
    importPath: "@/app/api/crm/activities/route",
    handler: "POST",
    request: new Request("http://localhost/api/crm/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "Logged" }),
    }),
  },
  {
    label: "POST /api/crm/deals",
    importPath: "@/app/api/crm/deals/route",
    handler: "POST",
    request: new Request("http://localhost/api/crm/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Deal" }),
    }),
  },
  {
    label: "POST /api/crm/tasks",
    importPath: "@/app/api/crm/tasks/route",
    handler: "POST",
    request: new Request("http://localhost/api/crm/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task" }),
    }),
  },
  {
    label: "PATCH /api/crm/tasks",
    importPath: "@/app/api/crm/tasks/route",
    handler: "PATCH",
    request: new Request("http://localhost/api/crm/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["t1"] }),
    }),
  },
  {
    label: "GET /api/email/audiences",
    importPath: "@/app/api/email/audiences/route",
    handler: "GET",
    request: new Request("http://localhost/api/email/audiences"),
  },
  {
    label: "POST /api/email/audiences",
    importPath: "@/app/api/email/audiences/route",
    handler: "POST",
    request: new Request("http://localhost/api/email/audiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Audience" }),
    }),
  },
  {
    label: "POST /api/email/members",
    importPath: "@/app/api/email/members/route",
    handler: "POST",
    request: new Request("http://localhost/api/email/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" }),
    }),
  },
  {
    label: "POST /api/email/campaigns",
    importPath: "@/app/api/email/campaigns/route",
    handler: "POST",
    request: new Request("http://localhost/api/email/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Campaign" }),
    }),
  },
  {
    label: "POST /api/email/campaigns/schedule",
    importPath: "@/app/api/email/campaigns/schedule/route",
    handler: "POST",
    request: new Request("http://localhost/api/email/campaigns/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: "cmp_1" }),
    }),
  },
  {
    label: "POST /api/email/automations",
    importPath: "@/app/api/email/automations/route",
    handler: "POST",
    request: new Request("http://localhost/api/email/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Automation" }),
    }),
  },
  {
    label: "POST /api/email/automations/trigger",
    importPath: "@/app/api/email/automations/trigger/route",
    handler: "POST",
    request: new Request("http://localhost/api/email/automations/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ automationId: "a1", contactId: "c1" }),
    }),
  },
  {
    label: "GET /api/cms/entries",
    importPath: "@/app/api/cms/entries/route",
    handler: "GET",
    request: new Request("http://localhost/api/cms/entries"),
  },
  {
    label: "POST /api/cms/entries",
    importPath: "@/app/api/cms/entries/route",
    handler: "POST",
    request: new Request("http://localhost/api/cms/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Entry" }),
    }),
  },
  {
    label: "GET /api/cms/collections",
    importPath: "@/app/api/cms/collections/route",
    handler: "GET",
    request: new Request("http://localhost/api/cms/collections"),
  },
  {
    label: "POST /api/cms/collections",
    importPath: "@/app/api/cms/collections/route",
    handler: "POST",
    request: new Request("http://localhost/api/cms/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Blog Posts" }),
    }),
  },
  {
    label: "POST /api/cms/media",
    importPath: "@/app/api/cms/media/route",
    handler: "POST",
    request: new Request("http://localhost/api/cms/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "image.jpg" }),
    }),
  },
  {
    label: "POST /api/content/autopilot",
    importPath: "@/app/api/content/autopilot/route",
    handler: "POST",
    request: new Request("http://localhost/api/content/autopilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
  },
  {
    label: "GET /api/content/autopilot/suggest",
    importPath: "@/app/api/content/autopilot/suggest/route",
    handler: "GET",
    request: new Request("http://localhost/api/content/autopilot/suggest?month=2026-03"),
  },
  {
    label: "GET /api/content/export",
    importPath: "@/app/api/content/export/route",
    handler: "GET",
    request: new Request("http://localhost/api/content/export"),
  },
  {
    label: "POST /api/content/generate",
    importPath: "@/app/api/content/generate/route",
    handler: "POST",
    request: new Request("http://localhost/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
  },
  {
    label: "GET /api/content/slots/[slotId]",
    importPath: "@/app/api/content/slots/[slotId]/route",
    handler: "GET",
    request: new Request("http://localhost/api/content/slots/slot_1"),
    context: { params: Promise.resolve({ slotId: "slot_1" }) },
  },
  {
    label: "POST /api/content/slots/reschedule",
    importPath: "@/app/api/content/slots/reschedule/route",
    handler: "POST",
    request: new Request("http://localhost/api/content/slots/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: "slot_1", scheduledFor: new Date().toISOString() }),
    }),
  },
];

describe("admin auth for exposed route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it.each(routeCases)("requires admin for $label", async ({ importPath, handler, request, context }) => {
    requireUserMock.mockRejectedValueOnce(new Error("Forbidden"));
    const mod = await import(importPath);
    const response = context
      ? await mod[handler](request, context)
      : await mod[handler](request);

    expect(requireUserMock).toHaveBeenCalledWith({ role: "ADMIN" });
    expect(response.status).toBe(400);
  });
});
