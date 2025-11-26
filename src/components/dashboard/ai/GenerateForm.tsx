"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TemplateOption = {
  id: string;
  name: string;
};

type GenerateFormProps = {
  templates: TemplateOption[];
  onQueued?: () => void;
};

export function GenerateForm({ templates, onQueued }: GenerateFormProps) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [prompt, setPrompt] = useState("Trichology scalp detox masterclass");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          prompt,
          input: { prompt },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to queue generation");
      }

      setMessage("Generation queued. Refresh shortly to view output.");
      router.refresh();
      onQueued?.();
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
          Template
        </label>
        <select
          value={templateId}
          onChange={(event) => setTemplateId(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
          Prompt details
        </label>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          rows={4}
        />
      </div>
      <button
        type="submit"
        disabled={loading || templates.length === 0}
        className="rounded-full border border-[#fab826]/50 bg-[#fab826]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#bf7c00] transition hover:border-[#fab826] hover:bg-[#fab826]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Queuing..." : "Queue Draft"}
      </button>
      {templates.length === 0 ? (
        <p className="text-xs text-black/50">Create a template first to generate copy.</p>
      ) : null}
      {message ? <p className="text-xs text-black/50">{message}</p> : null}
    </form>
  );
}

