"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    "Ready to elevate your salon science?"
  );
  const [emailPreview, setEmailPreview] = useState(
    "Inside is your tailored curriculum rundown and next steps."
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

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
        throw new Error("Failed to create automation");
      }

      setMessage("Automation activated.");
      router.refresh();
      onCreated?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm text-black/70">
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
          Automation Name
        </label>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
          Target Audience (optional)
        </label>
        <select
          value={audienceId}
          onChange={(event) => setAudienceId(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
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
          <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
            Wait Time (minutes)
          </label>
          <input
            type="number"
            min={0}
            value={waitMinutes}
            onChange={(event) => setWaitMinutes(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
            Nurture Subject
          </label>
          <input
            value={emailSubject}
            onChange={(event) => setEmailSubject(event.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
          Preview Text
        </label>
        <textarea
          value={emailPreview}
          onChange={(event) => setEmailPreview(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full border border-[#fab826]/50 bg-[#fab826]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#bf7c00] transition hover:border-[#fab826] hover:bg-[#fab826]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Deploying..." : "Activate Automation"}
      </button>
      {message ? <p className="text-xs text-black/50">{message}</p> : null}
    </form>
  );
}

