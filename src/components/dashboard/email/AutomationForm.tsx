"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";

type AudienceOption = {
  id: string;
  name: string;
};

type AutomationFormProps = {
  audiences: AudienceOption[];
  onCreated?: () => void;
};

export function AutomationForm({ audiences, onCreated }: AutomationFormProps) {
  const [name, setName] = useState("Enquiry Nurture");
  const [audienceId, setAudienceId] = useState(audiences[0]?.id ?? "");
  const [waitMinutes, setWaitMinutes] = useState(30);
  const [emailSubject, setEmailSubject] = useState(
    "Your Lorraine Hawkins care plan is ready"
  );
  const [emailPreview, setEmailPreview] = useState(
    "Here’s the personalised scalp roadmap Lorraine prepared for you."
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/email/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          audienceId: audienceId || null,
          status: "ACTIVE",
          triggerType: "EVENT",
          triggerConfig: { event: "course_enquiry.created" },
          steps: [
            {
              name: `Wait ${waitMinutes} minutes`,
              position: 0,
              type: "WAIT",
              config: { minutes: waitMinutes },
            },
            {
              name: "Send nurture campaign",
              position: 1,
              type: "SEND_EMAIL",
              config: {
                subject: emailSubject,
                preview: emailPreview,
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to create automation");
      }

      toast("Automation activated", "success");
      router.refresh();
      onCreated?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unexpected error";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent";
  const labelClass = "block text-xs font-medium uppercase tracking-wider text-admin-text-secondary";
  const btnPrimary =
    "rounded-md bg-admin-accent px-4 py-2 text-xs font-semibold text-black hover:bg-admin-accent-hover disabled:opacity-50 disabled:pointer-events-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm text-admin-text-secondary">
      <div>
        <label className={labelClass}>Automation Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Target Audience (optional)</label>
        <select
          value={audienceId}
          onChange={(e) => setAudienceId(e.target.value)}
          className={inputClass}
        >
          <option value="">All contacts</option>
          {audiences.map((audience) => (
            <option key={audience.id} value={audience.id}>
              {audience.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Wait Time (minutes)</label>
          <input
            type="number"
            min={0}
            value={waitMinutes}
            onChange={(e) => setWaitMinutes(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nurture Subject</label>
          <input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Preview Text</label>
        <textarea
          value={emailPreview}
          onChange={(e) => setEmailPreview(e.target.value)}
          className={inputClass}
          rows={3}
        />
      </div>
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? "Deploying..." : "Activate Automation"}
      </button>
    </form>
  );
}

