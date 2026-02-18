"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Surface } from "@/components/layout/Surface";
import { ButtonLink } from "@/components/ui/Button";

type ClaimResponse =
  | { ok: true; mode: "login" }
  | { ok: true; mode: "set-password"; token: string }
  | { ok: true; mode: "already-authenticated" }
  | { error: string };

export default function EducationSuccessClient() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = useMemo(() => params.get("session_id") ?? "", [params]);

  const [status, setStatus] = useState<"idle" | "claiming" | "waiting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    const run = async () => {
      setStatus("claiming");
      setError(null);

      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const res = await fetch("/api/education/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const json = (await res.json()) as ClaimResponse;

          if (cancelled) return;

          if (res.ok && "ok" in json && json.ok) {
            if (json.mode === "already-authenticated") {
              router.replace("/academy");
              return;
            }

            if (json.mode === "login") {
              router.replace("/login?next=/academy");
              return;
            }

            router.replace(`/set-password?token=${encodeURIComponent(json.token)}&next=/academy`);
            return;
          }

          if (res.status === 409) {
            setStatus("waiting");
            await new Promise((r) => setTimeout(r, 1200));
            continue;
          }

          setStatus("error");
          setError("error" in json ? json.error : "Unable to verify purchase");
          return;
        } catch (err) {
          if (cancelled) return;
          setStatus("error");
          setError(err instanceof Error ? err.message : "Unable to verify purchase");
          return;
        }
      }

      if (!cancelled) {
        setStatus("error");
        setError("Still processing payment. Please refresh in a moment.");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router, sessionId]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-xl items-center px-6 py-10">
      <Surface variant="glass" padding="lg" className="w-full space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">Academy</p>
          <h1 className="text-2xl font-semibold text-black">Purchase received</h1>
          <p className="mt-2 text-sm text-black/60">
            We&apos;re preparing access to your training. This usually takes a few seconds.
          </p>
        </div>

        {!sessionId ? (
          <p className="text-sm text-black/60">
            Missing session reference. Please return to education.
          </p>
        ) : null}

        {status === "claiming" ? (
          <p className="text-sm text-black/60">Confirming payment and creating your access...</p>
        ) : null}

        {status === "waiting" ? (
          <p className="text-sm text-black/60">Payment is processing... checking again.</p>
        ) : null}

        {status === "error" ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error ?? "Something went wrong."}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/education" variant="secondary" size="md">
                Back to education
              </ButtonLink>
              <ButtonLink href={`/login?next=/academy`} variant="ghost" size="md">
                Sign in
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </Surface>
    </div>
  );
}
