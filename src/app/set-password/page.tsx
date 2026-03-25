export const dynamic = "force-dynamic";
import { Suspense } from "react";
import SetPasswordClient from "./SetPasswordClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/set-password",
  title: "Set password",
  description: "Set your account password.",
  noIndex: true,
});

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-lg items-center px-6 py-10">
          <div className="w-full rounded-2xl border border-black/5 bg-white/80 p-8 text-sm text-black/60">
            Loading…
          </div>
        </div>
      }
    >
      <SetPasswordClient />
    </Suspense>
  );
}


