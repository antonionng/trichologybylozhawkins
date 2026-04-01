import { ShopOrderStatus } from "@prisma/client";
import { getOperationalAdminRecipients } from "@/server/modules/settings/notifications";
import {
  sendShopAdminOrderNotificationEmail,
  sendShopOrderConfirmationEmail,
} from "@/server/modules/email/transactional";

const meaningfulAdminStatuses = new Set<ShopOrderStatus>([
  ShopOrderStatus.CONFIRMED,
  ShopOrderStatus.PROCESSING,
  ShopOrderStatus.SHIPPED,
  ShopOrderStatus.DELIVERED,
  ShopOrderStatus.CANCELLED,
  ShopOrderStatus.REFUNDED,
]);

export async function getShopAdminNotifyEmails() {
  return getOperationalAdminRecipients();
}

export function shouldSendCustomerConfirmation(previousStatus: ShopOrderStatus, nextStatus: ShopOrderStatus) {
  return previousStatus !== ShopOrderStatus.CONFIRMED && nextStatus === ShopOrderStatus.CONFIRMED;
}

export function shouldSendAdminStatusNotification(previousStatus: ShopOrderStatus, nextStatus: ShopOrderStatus) {
  return previousStatus !== nextStatus && meaningfulAdminStatuses.has(nextStatus);
}

export function shouldSendAdminTrackingNotification(
  previousTrackingNumber?: string | null,
  nextTrackingNumber?: string | null,
  previousTrackingUrl?: string | null,
  nextTrackingUrl?: string | null,
) {
  const trackingNumberChanged = (previousTrackingNumber ?? "") !== (nextTrackingNumber ?? "");
  const trackingUrlChanged = (previousTrackingUrl ?? "") !== (nextTrackingUrl ?? "");
  const hasCurrentTracking = Boolean((nextTrackingNumber ?? "").trim() || (nextTrackingUrl ?? "").trim());

  return hasCurrentTracking && (trackingNumberChanged || trackingUrlChanged);
}

type ShopOrderEmailItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
};

type ShopOrderEmailOrder = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: ShopOrderStatus;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: ShopOrderEmailItem[];
};

type SendShopOrderLifecycleEmailsInput = {
  order: ShopOrderEmailOrder;
  previousStatus: ShopOrderStatus;
  previousTrackingNumber?: string | null;
  previousTrackingUrl?: string | null;
  appUrl: string;
  adminRecipients?: string[];
};

export async function sendShopOrderLifecycleEmails(input: SendShopOrderLifecycleEmailsInput) {
  const adminRecipients = input.adminRecipients ?? await getShopAdminNotifyEmails();
  const customerName = `${input.order.firstName} ${input.order.lastName}`.trim() || input.order.email;
  const statusChanged = shouldSendAdminStatusNotification(input.previousStatus, input.order.status);
  const trackingChanged = shouldSendAdminTrackingNotification(
    input.previousTrackingNumber,
    input.order.trackingNumber,
    input.previousTrackingUrl,
    input.order.trackingUrl,
  );
  const statusLabel = trackingChanged
    ? "Tracking updated"
    : `Order ${input.order.status.toLowerCase()}`;

  const jobs: Promise<unknown>[] = [];

  if (shouldSendCustomerConfirmation(input.previousStatus, input.order.status)) {
    jobs.push(
      sendShopOrderConfirmationEmail({
        to: input.order.email,
        appUrl: input.appUrl,
        orderId: input.order.id,
        customerName,
        customerEmail: input.order.email,
        subtotalAmount: input.order.subtotalAmount,
        shippingAmount: input.order.shippingAmount,
        totalAmount: input.order.totalAmount,
        currency: input.order.currency,
        trackingUrl: input.order.trackingUrl,
        items: input.order.items,
      })
    );
  }

  if (adminRecipients.length > 0 && (statusChanged || trackingChanged)) {
    jobs.push(
      sendShopAdminOrderNotificationEmail({
        to: adminRecipients,
        appUrl: input.appUrl,
        orderId: input.order.id,
        customerName,
        customerEmail: input.order.email,
        statusLabel,
        subtotalAmount: input.order.subtotalAmount,
        shippingAmount: input.order.shippingAmount,
        totalAmount: input.order.totalAmount,
        currency: input.order.currency,
        trackingUrl: input.order.trackingUrl,
        items: input.order.items,
      })
    );
  }

  if (jobs.length === 0) return;

  const results = await Promise.allSettled(jobs);
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[shop:email] failed to send order lifecycle email", result.reason);
    }
  });
}
