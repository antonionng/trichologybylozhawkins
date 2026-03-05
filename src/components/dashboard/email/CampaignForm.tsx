"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";

type AudienceOption = {
  id: string;
  name: string;
};

type CampaignFormProps = {
  audiences: AudienceOption[];
  onCreated?: () => void;
};

const inputClass =
  "mt-1 w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent";
const labelClass = "block text-xs font-medium uppercase tracking-wider text-admin-text-secondary";
const btnPrimary =
  "rounded-md bg-admin-accent px-4 py-2 text-xs font-semibold text-black hover:bg-admin-accent-hover disabled:opacity-50 disabled:pointer-events-none";

export function CampaignForm({ audiences, onCreated }: CampaignFormProps) {
  const [audienceId, setAudienceId] = useState(audiences[0]?.id ?? "");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [fromName, setFromName] = useState("Lorraine Hawkins Studio");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audienceId,
          name,
          subject,
          fromName,
          status: scheduledFor ? "SCHEDULED" : "DRAFT",
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to create campaign");
      }

      const created = await response.json();

      if (scheduledFor) {
        const scheduleRes = await fetch("/api/email/campaigns/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: created.id }),
        });
        if (!scheduleRes.ok) {
          const err = await scheduleRes.json().catch(() => ({}));
          toast(err.error ?? "Campaign saved but scheduling failed", "error");
        } else {
          toast("Campaign saved and scheduled", "success");
        }
      } else {
        toast("Campaign saved as draft", "success");
      }

      setName("");
      setSubject("");
      setMessage(null);
      router.refresh();
      onCreated?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      setMessage(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestSubject = async () => {
    setAiLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/ai/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a premium, concise subject line for the "${name || "Lorraine Hawkins"}" course announcement aimed at ${audiences.find((a) => a.id === audienceId)?.name ?? "our learners"}. Return only the subject line.`,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate subject");
      }
      const data = await response.json();
      const suggestion = typeof data.output === "string" ? data.output.trim() : "";
      if (suggestion) {
        setSubject(suggestion.replace(/["']/g, ""));
        toast("Subject generated", "success");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to generate subject";
      setMessage(msg);
      toast(msg, "error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm text-admin-text-secondary">
      <div>
        <label className={labelClass}>Audience</label>
        <select
          value={audienceId}
          onChange={(e) => setAudienceId(e.target.value)}
          className={inputClass}
        >
          {audiences.map((audience) => (
            <option key={audience.id} value={audience.id}>
              {audience.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Campaign Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Bootcamp Orientation"
        />
      </div>
      <div>
        <label className={labelClass}>Subject line</label>
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
          placeholder="Ready to access your salon growth playbook?"
        />
        <button
          type="button"
          onClick={handleSuggestSubject}
          disabled={aiLoading}
          className="mt-2 text-xs font-medium text-admin-accent hover:underline"
        >
          {aiLoading ? "Generating..." : "Suggest subject with AI"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>From Name</label>
          <input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Schedule (optional)</label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <button type="submit" disabled={loading || audiences.length === 0} className={btnPrimary}>
        {loading ? "Saving..." : "Save Campaign"}
      </button>
      {audiences.length === 0 && (
        <p className="text-xs text-admin-text-muted">Create an audience first to target your campaign.</p>
      )}
      {message && <p className="text-xs text-admin-danger">{message}</p>}
    </form>
  );
}

