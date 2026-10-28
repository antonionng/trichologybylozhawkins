import { Resend } from "resend";
import {
  DEFAULT_RESEND_FROM_EMAIL,
  getResendFromAddress,
} from "@/server/modules/email/transactional";

export type ResendLikelyCause = "RESEND_API_KEY" | "RESEND_FROM_EMAIL" | null;

export type ResendHealthReport = {
  ok: boolean;
  likelyCause: ResendLikelyCause;
  summary: string;
  apiKeyConfigured: boolean;
  fromAddress: string;
  fromEmail: string | null;
  fromDomain: string | null;
  appHostname: string | null;
  fromDomainMatchesSite: boolean | null;
  verifiedDomains: string[];
  resendError: string | null;
  probeSent: boolean;
  probeMessageId: string | null;
};

type ResendDomain = {
  name?: string;
  status?: string;
};

function parseFromAddress(from: string) {
  const angled = from.match(/<([^>]+)>/);
  const email = (angled?.[1] ?? from).trim().toLowerCase();
  if (!email.includes("@")) {
    return { email: null, domain: null };
  }
  return { email, domain: email.split("@")[1] ?? null };
}

function hostnameFromAppUrl(appUrl?: string) {
  if (!appUrl) return null;
  try {
    return new URL(appUrl.includes("://") ? appUrl : `https://${appUrl}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function describeResendError(error: unknown) {
  if (error && typeof error === "object") {
    const record = error as { message?: string; name?: string; statusCode?: number };
    const parts = [
      record.name,
      record.statusCode ? `HTTP ${record.statusCode}` : null,
      record.message,
    ].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(": ");
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "Unknown Resend error";
}

function inferLikelyCause(input: {
  apiKeyConfigured: boolean;
  fromDomain: string | null;
  verifiedDomains: string[];
  resendError: string | null;
}): ResendLikelyCause {
  if (!input.apiKeyConfigured) {
    return "RESEND_API_KEY";
  }

  const error = (input.resendError ?? "").toLowerCase();
  if (
    error.includes("domain") ||
    error.includes("from") ||
    error.includes("not verified")
  ) {
    return "RESEND_FROM_EMAIL";
  }

  if (
    error.includes("invalid api key") ||
    error.includes("unauthorized") ||
    error.includes("missing api key") ||
    error.includes("http 401") ||
    error.includes("http 403")
  ) {
    return "RESEND_API_KEY";
  }

  if (
    input.fromDomain &&
    input.verifiedDomains.length > 0 &&
    !input.verifiedDomains.includes(input.fromDomain)
  ) {
    return "RESEND_FROM_EMAIL";
  }

  if (input.fromDomain && input.verifiedDomains.length === 0 && input.resendError) {
    return "RESEND_FROM_EMAIL";
  }

  return input.resendError ? "RESEND_FROM_EMAIL" : null;
}

export async function probeResendHealth(options?: {
  sendProbe?: boolean;
  probeTo?: string;
  appUrl?: string;
}): Promise<ResendHealthReport> {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const fromAddress = getResendFromAddress();
  const { email: fromEmail, domain: fromDomain } = parseFromAddress(fromAddress);
  const appHostname = hostnameFromAppUrl(
    options?.appUrl ?? process.env.NEXT_PUBLIC_APP_URL,
  );
  const fromDomainMatchesSite = fromDomain && appHostname
    ? appHostname === fromDomain || appHostname.endsWith(`.${fromDomain}`)
    : null;

  const report: ResendHealthReport = {
    ok: false,
    likelyCause: null,
    summary: "",
    apiKeyConfigured: Boolean(apiKey),
    fromAddress,
    fromEmail,
    fromDomain,
    appHostname,
    fromDomainMatchesSite,
    verifiedDomains: [],
    resendError: null,
    probeSent: false,
    probeMessageId: null,
  };

  if (!apiKey) {
    report.likelyCause = "RESEND_API_KEY";
    report.summary = "RESEND_API_KEY is missing, so enquiry emails cannot be sent.";
    return report;
  }

  const client = new Resend(apiKey);

  try {
    const domainsResult = await client.domains.list();
    if (domainsResult.error) {
      report.resendError = describeResendError(domainsResult.error);
    } else {
      const domains = (domainsResult.data as { data?: ResendDomain[] } | ResendDomain[] | null);
      const list = Array.isArray(domains)
        ? domains
        : Array.isArray(domains?.data)
          ? domains.data
          : [];
      report.verifiedDomains = list
        .filter((domain) => (domain.status ?? "").toLowerCase() === "verified")
        .map((domain) => (domain.name ?? "").toLowerCase())
        .filter(Boolean);
    }
  } catch (error) {
    report.resendError = describeResendError(error);
  }

  if (options?.sendProbe) {
    const probeTo = options.probeTo?.trim();
    if (!probeTo) {
      report.resendError =
        report.resendError ??
        "A probe recipient is required when sendProbe is true.";
    } else {
      try {
        const sendResult = await client.emails.send({
          from: fromAddress,
          to: probeTo,
          subject: "[Trichology Academy] Resend health check",
          text: "This is a Resend health-check message from the Academy site. You can ignore it.",
        });
        if (sendResult.error) {
          report.resendError = describeResendError(sendResult.error);
        } else if (!sendResult.data?.id) {
          report.resendError = "Resend accepted the request but returned no message id.";
        } else {
          report.probeSent = true;
          report.probeMessageId = sendResult.data.id;
        }
      } catch (error) {
        report.resendError = describeResendError(error);
      }
    }
  }

  if (
    !report.resendError &&
    fromDomain &&
    report.verifiedDomains.length > 0 &&
    !report.verifiedDomains.includes(fromDomain)
  ) {
    report.resendError = `RESEND_FROM_EMAIL uses unverified domain ${fromDomain}. Verified domains: ${report.verifiedDomains.join(", ") || "none"}.`;
  }

  report.likelyCause = inferLikelyCause({
    apiKeyConfigured: report.apiKeyConfigured,
    fromDomain: report.fromDomain,
    verifiedDomains: report.verifiedDomains,
    resendError: report.resendError,
  });

  if (!report.resendError && (report.probeSent || !options?.sendProbe)) {
    report.ok = report.likelyCause === null;
  }

  if (report.ok) {
    report.summary = options?.sendProbe
      ? `Resend accepted a probe email from ${fromAddress}.`
      : `Resend API key is present and ${fromDomain ?? "the from domain"} looks usable.`;
  } else if (report.likelyCause === "RESEND_API_KEY") {
    report.summary =
      report.resendError ??
      "RESEND_API_KEY is missing or rejected by Resend.";
  } else if (report.likelyCause === "RESEND_FROM_EMAIL") {
    const fallbackNote =
      fromAddress === DEFAULT_RESEND_FROM_EMAIL
        ? " The code fallback from address is still the old clinic domain."
        : "";
    const siteNote =
      fromDomain && appHostname && fromDomain !== appHostname
        ? ` Production from domain ${fromDomain} does not match the live site ${appHostname}.`
        : "";
    report.summary = `${report.resendError ?? "The from address is not accepted by Resend."}${siteNote}${fallbackNote}`;
  } else {
    report.summary = report.resendError ?? "Resend health check failed.";
  }

  return report;
}
