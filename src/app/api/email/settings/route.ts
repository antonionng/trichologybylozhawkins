import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getOperationalAdminRecipients,
  saveOperationalAdminRecipients,
} from "@/server/modules/settings/notifications";
import { requireUser } from "@/server/security/auth";

const settingsSchema = z.object({
  adminNotificationEmails: z.array(z.string().email()).default([]),
});

export async function GET() {
  try {
    await requireUser({ role: "ADMIN" });
    const adminNotificationEmails = await getOperationalAdminRecipients();
    return NextResponse.json({ adminNotificationEmails });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load email settings";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json(
      {
        error: message,
      },
      { status },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireUser({ role: "ADMIN" });
    const payload = settingsSchema.parse(await request.json());
    const adminNotificationEmails = await saveOperationalAdminRecipients(
      payload.adminNotificationEmails,
    );
    return NextResponse.json({ adminNotificationEmails });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save email settings";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json(
      {
        error: message,
      },
      { status },
    );
  }
}
