"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

export default function SetPasswordClient() {
  const router = useRouter();
  const params = useSearchParams();

  const token = useMemo(() => params.get("token") ?? "", [params]);
  const nextPath = useMemo(() => params.get("next") ?? "/academy", [params]);
  const isAdminInvite = nextPath === "/dashboard" || nextPath.startsWith("/dashboard/");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; role?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Unable to set password.");
        return;
      }
      const destination = json.role === "ADMIN" ? "/dashboard" : nextPath;
      router.replace(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to set password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-lg items-center px-6 py-10">
      <Surface variant="glass" padding="lg" className="w-full space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">Set password</p>
          <h1 className="text-2xl font-semibold text-black">Create your login</h1>
          <p className="mt-2 text-sm text-black/60">
            {isAdminInvite
              ? "Choose a password to access the admin dashboard."
              : "Choose a password to access your purchased training."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">New password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/80 placeholder:text-black/30 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Confirm password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/80 placeholder:text-black/30 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save password"}
          </Button>
        </form>
      </Surface>
    </div>
  );
}



