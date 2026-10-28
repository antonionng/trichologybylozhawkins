"use client";

import Link from "next/link";
import { DIGITAL_CONTENT_CONSENT_TEXT } from "@/lib/digitalContentConsent";

export function DigitalContentConsent({
  id = "digital-content-consent",
  checked,
  onChange,
}: {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-left">
      <input
        id={id}
        type="checkbox"
        required
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-black/20 text-[#28577F] focus:ring-[#fab826]/40"
      />
      <span className="text-sm leading-relaxed text-black/70">
        {DIGITAL_CONTENT_CONSENT_TEXT}{" "}
        <Link href="/terms" className="font-medium text-[#b67400] underline underline-offset-2">
          Read the Terms
        </Link>
        .
      </span>
    </label>
  );
}
