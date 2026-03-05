"use client";

import { useState } from "react";
import { startCheckout, startBundleCheckout } from "@/app/actions/education";
import { Button } from "@/components/ui/Button";

type Tab = "login" | "signup";

type CheckoutAuthClientProps =
  | {
      courseId: string;
      priceId?: string;
      courseSlug: string;
      bundleSlug?: never;
    }
  | {
      courseId?: never;
      priceId?: never;
      courseSlug?: never;
      bundleSlug: string;
    };

export function CheckoutAuthClient({
  courseId,
  priceId,
  courseSlug,
  bundleSlug,
}: CheckoutAuthClientProps) {
  const [tab, setTab] = useState<Tab>("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const proceedAfterAuth = async () => {
    if (bundleSlug) {
      await startBundleCheckout(bundleSlug);
    } else if (courseId) {
      await startCheckout(courseId, priceId);
    } else {
      throw new Error("Missing course or bundle");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Login failed");
        return;
      }
      await proceedAfterAuth();
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Signup failed");
        return;
      }
      await proceedAfterAuth();
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-black/80 placeholder:text-black/30 focus:border-[#fab826] focus:outline-none focus:ring-2 focus:ring-[#fab826]/20";

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex rounded-xl bg-black/[0.03] p-1">
        <button
          type="button"
          onClick={() => { setTab("signup"); setError(null); }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === "signup"
              ? "bg-white text-black shadow-sm"
              : "text-black/50 hover:text-black/70"
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          onClick={() => { setTab("login"); setError(null); }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === "login"
              ? "bg-white text-black shadow-sm"
              : "text-black/50 hover:text-black/70"
          }`}
        >
          Sign In
        </button>
      </div>

      {tab === "signup" ? (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-[0.2em] text-black/60">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                className={inputClassName}
                placeholder="Jane"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-[0.2em] text-black/60">
                Last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                className={inputClassName}
                placeholder="Smith"
              />
            </div>
          </div>
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? "Processing..." : "Create account & checkout"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.2em] text-black/60">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className={inputClassName}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in & checkout"}
          </Button>
        </form>
      )}

      <p className="text-center text-[10px] text-black/35 leading-relaxed">
        Your payment will be processed securely via Stripe after {tab === "signup" ? "account creation" : "signing in"}.
      </p>
    </div>
  );
}
