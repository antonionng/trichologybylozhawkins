import {
  sendAcademySignupWelcomeEmail,
  sendEducationPurchaseAdminEmail,
  sendEducationPurchaseConfirmationEmail,
} from "@/server/modules/email/transactional";
import { getOperationalAdminRecipients } from "@/server/modules/settings/notifications";
import { getServerEnv } from "@/server/schema";

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
  getServerEnv().NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export async function sendAcademySignupNotifications(
  input: AcademySignupNotificationInput,
) {
  try {
    const result = await sendAcademySignupWelcomeEmail({
      to: input.email,
      appUrl: getAppUrl(),
      firstName: input.firstName ?? undefined,
      videoTitle: input.videoTitle ?? undefined,
    });
    if (result.skipped) {
      console.warn("[education:email] academy signup welcome not delivered:", result.reason);
    }
    return result;
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
    const appUrl = getAppUrl();
    const adminRecipients = await getOperationalAdminRecipients();
    const customerResult = await sendEducationPurchaseConfirmationEmail({
      to: input.email,
      appUrl,
      orderId: input.orderId,
      customerName,
      totalAmount: input.totalAmount,
      currency: input.currency,
      items: input.items,
    });
    if (customerResult.skipped) {
      console.warn("[education:email] purchase confirmation not delivered:", customerResult.reason);
    }

    if (adminRecipients.length > 0) {
      const adminResult = await sendEducationPurchaseAdminEmail({
        to: adminRecipients,
        appUrl,
        orderId: input.orderId,
        customerName,
        customerEmail: input.email,
        totalAmount: input.totalAmount,
        currency: input.currency,
        items: input.items,
      });
      if (adminResult.skipped) {
        console.warn("[education:email] admin purchase notification not delivered:", adminResult.reason);
      }
    }

    return customerResult;
  } catch (error) {
    console.error("[education:email] failed to send purchase confirmation", error);
    return { skipped: true as const, reason: "Send failed" };
  }
}
