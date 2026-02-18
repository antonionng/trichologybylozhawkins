"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/admin/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminTextarea } from "@/components/admin/AdminTextarea";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useToast } from "@/components/admin/Toast";

type Condition = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  whatIsIt: string | null;
  symptoms: any;
  causes: any;
  treatments: any;
  keyFacts: any;
  imageUrl: string | null;
  relatedConditions: any;
  status: string;
  courses: Array<{ course: { id: string; title: string; slug: string } }>;
};

export function ConditionEditor({ condition }: { condition: Condition }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: condition.name,
    slug: condition.slug,
    category: condition.category || "",
    description: condition.description || "",
    whatIsIt: condition.whatIsIt || "",
    symptoms: Array.isArray(condition.symptoms) ? condition.symptoms.join("\n") : "",
    causes: Array.isArray(condition.causes) ? condition.causes.join("\n") : "",
    treatments: Array.isArray(condition.treatments) ? condition.treatments.join("\n") : "",
    keyFacts: Array.isArray(condition.keyFacts) ? condition.keyFacts.join("\n") : "",
    status: condition.status,
  });

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/education/conditions/${condition.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, slug: form.slug,
          category: form.category || undefined, description: form.description || undefined,
          whatIsIt: form.whatIsIt || undefined,
          symptoms: form.symptoms.split("\n").map((s) => s.trim()).filter(Boolean),
          causes: form.causes.split("\n").map((s) => s.trim()).filter(Boolean),
          treatments: form.treatments.split("\n").map((s) => s.trim()).filter(Boolean),
          keyFacts: form.keyFacts.split("\n").map((s) => s.trim()).filter(Boolean),
          status: form.status,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to save"); }
      toast("Condition saved", "success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      toast("Failed to save", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={form.name || "Edit Condition"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Education", href: "/dashboard/education" },
          { label: "Conditions", href: "/dashboard/education/conditions" },
          { label: form.name || "Edit" },
        ]}
        actions={
          <AdminButton variant="primary" size="md" onClick={handleSave} loading={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </AdminButton>
        }
      />

      {error && (
        <Panel variant="elevated" padding="sm" className="border-admin-danger/30 text-admin-danger text-sm">{error}</Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel variant="default" padding="lg" className="space-y-4">
          <h2 className="text-sm font-semibold text-admin-text">Basic Info</h2>
          <AdminInput label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <AdminInput label="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          <AdminSelect label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            placeholder="Select category…"
            options={[
              { value: "Hair Loss", label: "Hair Loss" },
              { value: "Scalp Dermatitis", label: "Scalp Dermatitis" },
              { value: "Scalp Infection", label: "Scalp Infection" },
              { value: "Scalp & Hair Condition", label: "Scalp & Hair Condition" },
              { value: "Other", label: "Other" },
            ]}
          />
          <AdminSelect label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            options={[
              { value: "DRAFT", label: "Draft" },
              { value: "PUBLISHED", label: "Published" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
          />
          <AdminTextarea label="Description" value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Brief overview…" />
          <AdminTextarea label="What Is It?" value={form.whatIsIt}
            onChange={(e) => setForm((p) => ({ ...p, whatIsIt: e.target.value }))} rows={4} placeholder="Detailed explanation…" />
        </Panel>

        <div className="space-y-4">
          <Panel variant="default" padding="lg" className="space-y-3">
            <h2 className="text-sm font-semibold text-admin-text">Signs & Symptoms</h2>
            <AdminTextarea value={form.symptoms} onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))} rows={5} placeholder="One per line…" />
          </Panel>
          <Panel variant="default" padding="lg" className="space-y-3">
            <h2 className="text-sm font-semibold text-admin-text">Causes & Risk Factors</h2>
            <AdminTextarea value={form.causes} onChange={(e) => setForm((p) => ({ ...p, causes: e.target.value }))} rows={5} placeholder="One per line…" />
          </Panel>
          <Panel variant="default" padding="lg" className="space-y-3">
            <h2 className="text-sm font-semibold text-admin-text">Treatment Options</h2>
            <AdminTextarea value={form.treatments} onChange={(e) => setForm((p) => ({ ...p, treatments: e.target.value }))} rows={5} placeholder="One per line…" />
          </Panel>
          <Panel variant="default" padding="lg" className="space-y-3">
            <h2 className="text-sm font-semibold text-admin-text">Key Facts</h2>
            <AdminTextarea value={form.keyFacts} onChange={(e) => setForm((p) => ({ ...p, keyFacts: e.target.value }))} rows={5} placeholder="One per line…" />
          </Panel>
        </div>
      </div>
    </div>
  );
}
