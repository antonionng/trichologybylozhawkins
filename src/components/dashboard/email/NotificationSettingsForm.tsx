"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";

const inputClass =
  "mt-1 w-full rounded-md border border-admin-border-strong bg-admin-elevated px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent";
const labelClass = "block text-xs font-medium uppercase tracking-wider text-admin-text-secondary";
const btnPrimary =
  "rounded-md bg-admin-accent px-4 py-2 text-xs font-semibold text-black hover:bg-admin-accent-hover disabled:opacity-50 disabled:pointer-events-none";

type NotificationSettingsFormProps = {
  adminNotificationEmails: string[];
};

function parseTextarea(value: string) {
  return [...new Set(
    value
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean),
  )];
}

export function NotificationSettingsForm({
  adminNotificationEmails,
}: NotificationSettingsFormProps) {
  const [value, setValue] = useState(adminNotificationEmails.join("\n"));
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const normalizedPreview = useMemo(() => parseTextarea(value), [value]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNotificationEmails: parseTextarea(value),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save email settings");
      }

      setValue((payload.adminNotificationEmails ?? []).join("\n"));
      toast("Operational email settings saved", "success");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-admin-text-secondary">
      <div>
        <label className={labelClass}>Admin notification recipients</label>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={inputClass}
          rows={6}
          placeholder={"ops@example.com\nteam@example.com"}
        />
        <p className="mt-2 text-xs text-admin-text-muted">
          Used for operational admin emails like quiz leads, chat leads, purchases, contact forms,
          and enquiries. Enter one address per line or separate with commas.
        </p>
      </div>

      <div className="rounded-md border border-admin-border bg-admin-panel p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-admin-text-secondary">
          Current recipients
        </p>
        <p className="mt-2 text-sm text-admin-text">
          {normalizedPreview.length > 0 ? normalizedPreview.join(", ") : "No admin notifications will be sent."}
        </p>
      </div>

      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? "Saving..." : "Save operational settings"}
      </button>
    </form>
  );
}
