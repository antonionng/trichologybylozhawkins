"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";

type AudienceFormProps = {
  onCreated?: () => void;
};

const inputClass =
  "mt-1 w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent";
const labelClass = "block text-xs font-medium uppercase tracking-wider text-admin-text-secondary";
const btnPrimary =
  "rounded-md bg-admin-accent px-4 py-2 text-xs font-semibold text-black hover:bg-admin-accent-hover disabled:opacity-50 disabled:pointer-events-none";

export function AudienceForm({ onCreated }: AudienceFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/email/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to create audience");
      }

      setName("");
      setDescription("");
      toast("Audience created", "success");
      router.refresh();
      onCreated?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm text-admin-text-secondary">
      <div>
        <label className={labelClass}>Audience Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Cohort Leaders"
        />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          rows={3}
          placeholder="Learners who started checkout but requested guidance"
        />
      </div>
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? "Saving..." : "Create Audience"}
      </button>
    </form>
  );
}

