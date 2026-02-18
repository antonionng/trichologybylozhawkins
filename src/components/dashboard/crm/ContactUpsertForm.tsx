"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminTextarea } from "@/components/admin/AdminTextarea";
import { AdminButton } from "@/components/admin/AdminButton";

type Mode = "create" | "edit";

type ContactInput = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  source?: string;
  ownerId?: string;
  lifecycleStage?: string;
  notes?: string;
  companyId?: string;
};

const LIFECYCLE_OPTIONS = [
  { value: "LEAD", label: "Lead" },
  { value: "MARKETING_QUALIFIED_LEAD", label: "Marketing Qualified Lead" },
  { value: "SALES_QUALIFIED_LEAD", label: "Sales Qualified Lead" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "EVANGELIST", label: "Evangelist" },
  { value: "OTHER", label: "Other" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "Select source..." },
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "EVENT", label: "Event" },
  { value: "DIRECT", label: "Direct" },
  { value: "OTHER", label: "Other" },
];

async function saveContact(input: ContactInput) {
  const res = await fetch("/api/crm/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? "Failed to save contact");
  return json as { id: string };
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-admin-text-muted">
        {label}
      </span>
      <div className="h-px flex-1 bg-admin-border" />
    </div>
  );
}

export function ContactUpsertForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: Partial<ContactInput>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo(() => {
    return {
      firstName: initial?.firstName ?? "",
      lastName: initial?.lastName ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      jobTitle: initial?.jobTitle ?? "",
      source: initial?.source ?? "",
      ownerId: initial?.ownerId ?? "",
      lifecycleStage: initial?.lifecycleStage ?? "LEAD",
      notes: initial?.notes ?? "",
      companyId: initial?.companyId ?? "",
    };
  }, [initial]);

  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: ContactInput = {
        ...(initial?.id ? { id: initial.id } : null),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        source: form.source.trim() || undefined,
        ownerId: form.ownerId.trim() || undefined,
        lifecycleStage: form.lifecycleStage || undefined,
        notes: form.notes || undefined,
        companyId: form.companyId.trim() || undefined,
      };

      const saved = await saveContact(payload);
      startTransition(() => router.push(`/dashboard/crm/contacts/${saved.id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* ── Contact Info ── */}
      <SectionDivider label="Contact Info" />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminInput
          label="First name"
          value={form.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          required
        />
        <AdminInput
          label="Last name"
          value={form.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          required
        />
        <AdminInput
          label="Phone"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+44 7700 900000"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminInput
          label="Job title"
          value={form.jobTitle}
          onChange={(e) => onChange("jobTitle", e.target.value)}
        />
        <AdminInput
          label="Company"
          value={form.companyId}
          onChange={(e) => onChange("companyId", e.target.value)}
          placeholder="Company ID"
        />
      </div>

      {/* ── Classification ── */}
      <SectionDivider label="Classification" />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminSelect
          label="Lifecycle stage"
          value={form.lifecycleStage}
          onChange={(e) => onChange("lifecycleStage", e.target.value)}
          options={LIFECYCLE_OPTIONS}
        />
        <AdminSelect
          label="Source"
          value={form.source}
          onChange={(e) => onChange("source", e.target.value)}
          options={SOURCE_OPTIONS}
        />
      </div>

      {/* ── Internal ── */}
      <SectionDivider label="Internal" />
      <AdminInput
        label="Owner"
        value={form.ownerId}
        onChange={(e) => onChange("ownerId", e.target.value)}
        placeholder="Assign an owner (optional)"
      />
      <AdminTextarea
        label="Notes"
        value={form.notes}
        onChange={(e) => onChange("notes", e.target.value)}
        rows={4}
        placeholder="Profile notes (history, preferences, context)..."
      />

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <AdminButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={saving}
          loading={saving}
        >
          {mode === "create" ? "Create contact" : "Save changes"}
        </AdminButton>
      </div>
    </form>
  );
}
