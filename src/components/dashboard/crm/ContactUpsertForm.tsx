"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            First name
          </label>
          <input
            value={form.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
            required
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Last name
          </label>
          <input
            value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
            required
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Phone
          </label>
          <input
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Job title
          </label>
          <input
            value={form.jobTitle}
            onChange={(e) => onChange("jobTitle", e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Lifecycle stage
          </label>
          <select
            value={form.lifecycleStage}
            onChange={(e) => onChange("lifecycleStage", e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
          >
            {LIFECYCLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Source
          </label>
          <input
            value={form.source}
            onChange={(e) => onChange("source", e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Owner ID
          </label>
          <input
            value={form.ownerId}
            onChange={(e) => onChange("ownerId", e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
            placeholder="(optional)"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.35em] text-black/40">
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          className="mt-2 min-h-[120px] w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
          placeholder="Profile notes (history, preferences, context)..."
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-brand-salmon/40 bg-brand-salmon/10 px-4 py-3 text-sm text-brand-graphite">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl border border-[#fab826]/40 bg-[#fab826]/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b67400] transition hover:border-[#fab826] hover:bg-[#fab826]/20 disabled:opacity-40"
        >
          {saving ? "Saving..." : mode === "create" ? "Create contact" : "Save changes"}
        </button>
      </div>
    </form>
  );
}



