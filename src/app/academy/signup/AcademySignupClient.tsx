"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { Button } from "@/components/ui/Button";

export default function AcademySignupClient({
  freeVideoTitle,
}: {
  freeVideoTitle: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = useMemo(() => params.get("next"), [params]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        academyPath?: string;
      };

      if (!res.ok || !json.ok) {
        setError(json.error ?? "Signup failed");
        return;
      }

      router.replace(nextPath || json.academyPath || "/academy");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-black/80 placeholder:text-black/30 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20";
  const offerLabel = freeVideoTitle ? `the free ${freeVideoTitle} lesson` : "your full quiz results";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-xl items-center px-6 py-10">
      <Surface variant="glass" padding="lg" className="w-full space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">Academy signup</p>
          <h1 className="text-2xl font-semibold text-black">Create your free academy account</h1>
          <p className="mt-2 text-sm text-black/60">
            Join the academy to unlock {offerLabel} and explore the wider training library.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-black/60">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClassName}
                placeholder="Jane"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-black/60">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClassName}
                placeholder="Smith"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className={inputClassName}
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
              className={inputClassName}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              minLength={8}
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
            {loading ? "Creating account..." : "Create your free academy account"}
          </Button>
        </form>
      </Surface>
    </div>
  );
}
