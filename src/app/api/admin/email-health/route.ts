import { NextResponse } from "next/server";
import { requireUser } from "@/server/security/auth";
import { probeResendHealth } from "@/server/modules/email/resend-health";
import { REQUIRED_ENQUIRY_ADMIN_RECIPIENTS } from "@/server/modules/settings/notifications";

export const dynamic = "force-dynamic";

async function runHealthCheck(sendProbe: boolean, probeTo?: string) {
  await requireUser({ role: "ADMIN" });
  return probeResendHealth({
    sendProbe,
    probeTo,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });
}

export async function GET() {
  try {
    const report = await runHealthCheck(false);
    return NextResponse.json(report, { status: report.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to run Resend health check",
      },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { to?: string };
    const probeTo =
      body.to?.trim() ||
      process.env.RESEND_HEALTHCHECK_TO?.trim() ||
      REQUIRED_ENQUIRY_ADMIN_RECIPIENTS[0];
    const report = await runHealthCheck(true, probeTo);
    return NextResponse.json(report, { status: report.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to run Resend health check",
      },
      { status: 401 },
    );
  }
}
