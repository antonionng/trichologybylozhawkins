import { getServerEnv } from "@/server/schema";
import {
  sendAcademySignupWelcomeEmail,
  sendEducationPurchaseConfirmationEmail,
} from "@/server/modules/email/transactional";

type AcademySignupNotificationInput = {
  contactId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  videoTitle?: string | null;
};

type EducationPurchaseNotificationInput = {
  orderId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  totalAmount: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    unitAmount: number;
    currency: string;
  }>;
};

const getAppUrl = () =>
  getServerEnv().NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendAcademySignupNotifications(
  input: AcademySignupNotificationInput,
) {
  try {
    return await sendAcademySignupWelcomeEmail({
      to: input.email,
      appUrl: getAppUrl(),
      firstName: input.firstName ?? undefined,
      videoTitle: input.videoTitle ?? undefined,
    });
  } catch (error) {
    console.error("[education:email] failed to send academy signup email", error);
    return { skipped: true as const, reason: "Send failed" };
  }
}

export async function sendEducationPurchaseNotifications(
  input: EducationPurchaseNotificationInput,
) {
  try {
    const customerName =
      `${input.firstName ?? ""} ${input.lastName ?? ""}`.trim() || input.email;
    return await sendEducationPurchaseConfirmationEmail({
      to: input.email,
      appUrl: getAppUrl(),
      orderId: input.orderId,
      customerName,
      totalAmount: input.totalAmount,
      currency: input.currency,
      items: input.items,
    });
  } catch (error) {
    console.error("[education:email] failed to send purchase confirmation", error);
    return { skipped: true as const, reason: "Send failed" };
  }
}
