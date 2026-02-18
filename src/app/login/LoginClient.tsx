"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = useMemo(() => params.get("next") ?? "/dashboard", [params]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; role?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Login failed");
        return;
      }
      const destination = json.role === "ADMIN" ? nextPath : "/academy";
      router.replace(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-lg items-center px-6 py-10">
      <Surface variant="glass" padding="lg" className="w-full space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">Sign in</p>
          <h1 className="text-2xl font-semibold text-black">Access your portal</h1>
          <p className="mt-2 text-sm text-black/60">
            Lorraine admins manage courses. Learners access purchased training.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/80 placeholder:text-black/30 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/80 placeholder:text-black/30 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20"
              placeholder="••••••••"
              autoComplete="current-password"
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
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Surface>
    </div>
  );
}



