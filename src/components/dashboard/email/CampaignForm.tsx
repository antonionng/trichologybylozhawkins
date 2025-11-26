"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AudienceOption = {
  id: string;
  name: string;
};

type CampaignFormProps = {
  audiences: AudienceOption[];
  onCreated?: () => void;
};

export function CampaignForm({ audiences, onCreated }: CampaignFormProps) {
  const [audienceId, setAudienceId] = useState(audiences[0]?.id ?? "");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [fromName, setFromName] = useState("Bunny at Home Academy");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

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
        throw new Error("Failed to create campaign");
      }

      const created = await response.json();

      if (scheduledFor) {
        await fetch("/api/email/campaigns/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: created.id }),
        });
      }

      setName("");
      setSubject("");
      setMessage("Campaign saved and queued.");
      router.refresh();
      onCreated?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error");
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
          prompt: `Write a premium, concise subject line for the "${name || "Bunny at Home"}" course announcement aimed at ${audiences.find((a) => a.id === audienceId)?.name ?? "our learners"}. Return only the subject line.`,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate subject");
      }
      const data = await response.json();
      const suggestion = typeof data.output === "string" ? data.output.trim() : "";
      if (suggestion) {
        setSubject(suggestion.replace(/["']/g, ""));
        setMessage("Subject generated via AI Studio.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate subject");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm text-black/70">
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
          Audience
        </label>
        <select
          value={audienceId}
          onChange={(event) => setAudienceId(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
        >
          {audiences.map((audience) => (
            <option key={audience.id} value={audience.id}>
              {audience.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
          Campaign Name
        </label>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          placeholder="Bootcamp Orientation"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
          Subject line
        </label>
        <input
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          placeholder="Ready to access your salon growth playbook?"
        />
        <button
          type="button"
          onClick={handleSuggestSubject}
          disabled={aiLoading}
          className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#bf7c00] transition hover:text-[#fab826]"
        >
          {aiLoading ? "Generating..." : "Suggest subject with AI"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
            From Name
          </label>
          <input
            value={fromName}
            onChange={(event) => setFromName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
            Schedule (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(event) => setScheduledFor(event.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || audiences.length === 0}
        className="rounded-full border border-[#fab826]/50 bg-[#fab826]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#bf7c00] transition hover:border-[#fab826] hover:bg-[#fab826]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Campaign"}
      </button>
      {audiences.length === 0 ? (
        <p className="text-xs text-black/50">Create an audience first to target your campaign.</p>
      ) : null}
      {message ? <p className="text-xs text-black/50">{message}</p> : null}
    </form>
  );
}

