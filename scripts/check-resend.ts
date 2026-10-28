import { probeResendHealth } from "../src/server/modules/email/resend-health";

function argValue(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

async function main() {
  const sendProbe = process.argv.includes("--send");
  const report = await probeResendHealth({
    sendProbe,
    probeTo: argValue("--to") ?? process.env.RESEND_HEALTHCHECK_TO,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });

  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) {
    console.error(`\nResend health check failed. Likely cause: ${report.likelyCause ?? "unknown"}`);
    console.error(report.summary);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[resend:health] script crashed", error);
  process.exit(1);
});
