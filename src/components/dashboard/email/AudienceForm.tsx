"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AudienceFormProps = {
  onCreated?: () => void;
};

export function AudienceForm({ onCreated }: AudienceFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/email/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to create audience");
      }

      setName("");
      setDescription("");
      setMessage("Audience created successfully.");
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
          Audience Name
        </label>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          placeholder="Cohort Leaders"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-black/40">
          Description
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 focus:border-[#fab826] focus:outline-none"
          rows={3}
          placeholder="Learners who started checkout but requested guidance"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full border border-[#fab826]/50 bg-[#fab826]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#bf7c00] transition hover:border-[#fab826] hover:bg-[#fab826]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Create Audience"}
      </button>
      {message ? <p className="text-xs text-black/50">{message}</p> : null}
    </form>
  );
}

