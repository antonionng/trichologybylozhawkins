"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/Toast";

export function InviteAdminForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        toast(json.error ?? "Could not send invite.", "error");
        return;
      }
      toast("Invite email sent.", "success");
      setEmail("");
      router.refresh();
    } catch {
      toast("Could not send invite.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1 space-y-1.5">
        <label htmlFor="invite-admin-email" className="text-xs font-medium text-admin-text-secondary">
          Email address
        </label>
        <input
          id="invite-admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          className="w-full rounded-lg border border-admin-border bg-admin-panel px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
        />
      </div>
      <Button type="submit" variant="primary" disabled={loading} className="shrink-0">
        {loading ? "Sending…" : "Send invite"}
      </Button>
    </form>
  );
}
