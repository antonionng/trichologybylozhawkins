"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton } from "@/components/admin/AdminButton";
import { useToast } from "@/components/admin/Toast";

export function GenerateAllNotesButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-all-video-notes", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Generation failed");

      if (json.generated === 0) {
        toast("All videos already have notes", "success");
      } else {
        toast(`Generated notes for ${json.generated} video${json.generated > 1 ? "s" : ""}${json.failed ? ` (${json.failed} failed)` : ""}`, "success");
      }
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Generation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminButton variant="ghost" size="md" onClick={onClick} loading={loading}>
      {loading ? "Generating…" : "Generate All Missing Notes"}
    </AdminButton>
  );
}
