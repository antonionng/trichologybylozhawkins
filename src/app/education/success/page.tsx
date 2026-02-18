export const dynamic = "force-dynamic";
import { Suspense } from "react";
import EducationSuccessClient from "./EducationSuccessClient";

type ClaimResponse =
  | { ok: true; mode: "login" }
  | { ok: true; mode: "set-password"; token: string }
  | { error: string };

export default function EducationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-xl items-center px-6 py-10">
          <div className="w-full rounded-2xl border border-black/5 bg-white/80 p-8 text-sm text-black/60">
            Loading…
          </div>
        </div>
      }
    >
      <EducationSuccessClient />
    </Suspense>
  );
}


