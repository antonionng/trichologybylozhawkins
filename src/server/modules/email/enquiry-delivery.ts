import { prisma } from "@/server/db/client";
import { getResendFromAddress } from "@/server/modules/email/transactional";

export type EnquiryEmailSendResult =
  | { skipped: true; reason: string }
  | { skipped: false; id: string };

export type EnquiryEmailJob = {
  name: string;
  run: () => Promise<EnquiryEmailSendResult>;
};

export type EnquiryEmailJobOutcome = {
  name: string;
  ok: boolean;
  skipped: boolean;
  id?: string;
  error?: string;
};

export type EnquiryEmailDeliveryOutcome = {
  status: "sent" | "failed" | "partial" | "skipped";
  error: string | null;
  results: EnquiryEmailJobOutcome[];
};

function describeFailure(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "Unknown email delivery error";
}

export function summariseEnquiryEmailResults(
  results: EnquiryEmailJobOutcome[],
): EnquiryEmailDeliveryOutcome {
  if (results.length === 0) {
    return {
      status: "skipped",
      error: "No enquiry emails were queued.",
      results,
    };
  }

  const failures = results.filter((result) => !result.ok);
  const skipped = results.filter((result) => result.skipped);
  const sent = results.filter((result) => result.ok && !result.skipped);

  if (failures.length === 0) {
    return { status: "sent", error: null, results };
  }

  const error = failures
    .map((result) => `${result.name}: ${result.error ?? "failed"}`)
    .join(" | ");

  if (sent.length === 0 && skipped.length === results.length) {
    return { status: "skipped", error, results };
  }

  if (sent.length === 0) {
    return { status: "failed", error, results };
  }

  return { status: "partial", error, results };
}

export async function persistEnquiryEmailOutcome(options: {
  contactId: string;
  courseEnquiryId?: string;
  outcome: EnquiryEmailDeliveryOutcome;
}) {
  const { contactId, courseEnquiryId, outcome } = options;
  const notificationAt = new Date();

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      enquiryNotificationStatus: outcome.status,
      enquiryNotificationError: outcome.error,
      enquiryNotificationAt: notificationAt,
    },
  });

  if (courseEnquiryId) {
    await prisma.courseEnquiry.update({
      where: { id: courseEnquiryId },
      data: {
        notificationStatus: outcome.status,
        notificationError: outcome.error,
        notificationSentAt: outcome.status === "sent" ? notificationAt : null,
      },
    });
  }

  if (outcome.status === "sent") {
    return;
  }

  await prisma.activity.create({
    data: {
      contactId,
      type: "EMAIL",
      subject: "Enquiry notification email failed",
      body: [
        `Status: ${outcome.status}`,
        outcome.error ? `Error: ${outcome.error}` : null,
        `From: ${getResendFromAddress()}`,
        "",
        ...outcome.results.map((result) => {
          const detail = result.ok
            ? result.skipped
              ? `skipped (${result.error ?? "no reason"})`
              : `sent (${result.id ?? "no id"})`
            : `FAILED (${result.error ?? "unknown error"})`;
          return `- ${result.name}: ${detail}`;
        }),
      ]
        .filter(Boolean)
        .join("\n"),
      outcome: "NEEDS_FOLLOW_UP",
      activityAt: notificationAt,
    },
  });
}

export async function sendAndRecordEnquiryEmails(options: {
  contactId: string;
  courseEnquiryId?: string;
  jobs: EnquiryEmailJob[];
}): Promise<EnquiryEmailDeliveryOutcome> {
  const settled = await Promise.allSettled(options.jobs.map((job) => job.run()));
  const results: EnquiryEmailJobOutcome[] = settled.map((result, index) => {
    const name = options.jobs[index]?.name ?? `email-${index + 1}`;

    if (result.status === "rejected") {
      return {
        name,
        ok: false,
        skipped: false,
        error: describeFailure(result.reason),
      };
    }

    if (result.value.skipped) {
      return {
        name,
        ok: false,
        skipped: true,
        error: result.value.reason,
      };
    }

    return {
      name,
      ok: true,
      skipped: false,
      id: result.value.id,
    };
  });

  const outcome = summariseEnquiryEmailResults(results);

  if (outcome.status !== "sent") {
    console.error("[enquiry:email] Enquiry notification delivery failed", {
      contactId: options.contactId,
      courseEnquiryId: options.courseEnquiryId,
      status: outcome.status,
      error: outcome.error,
      from: getResendFromAddress(),
      results: outcome.results,
    });
  }

  try {
    await persistEnquiryEmailOutcome({
      contactId: options.contactId,
      courseEnquiryId: options.courseEnquiryId,
      outcome,
    });
  } catch (error) {
    console.error("[enquiry:email] Failed to persist enquiry email outcome", {
      contactId: options.contactId,
      courseEnquiryId: options.courseEnquiryId,
      error: describeFailure(error),
    });
  }

  return outcome;
}
