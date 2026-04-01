import { prisma } from "@/server/db/client";
import { getServerEnv, parseEmailList } from "@/server/schema/env";

const NOTIFICATION_SETTINGS_ID = "default";

function normalizeEmailList(values: string[]) {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))];
}

function getFallbackAdminRecipients() {
  const env = getServerEnv();
  return normalizeEmailList([
    ...parseEmailList(env.SHOP_ADMIN_NOTIFY_EMAILS),
    ...(env.CHAT_ADMIN_NOTIFY_EMAIL ? [env.CHAT_ADMIN_NOTIFY_EMAIL] : []),
  ]);
}

export async function getOperationalAdminRecipients() {
  const settings = await prisma.notificationSettings.findUnique({
    where: { id: NOTIFICATION_SETTINGS_ID },
  });

  if (!settings) {
    return getFallbackAdminRecipients();
  }

  return normalizeEmailList(settings.adminNotificationEmails);
}

export async function saveOperationalAdminRecipients(values: string[]) {
  const adminNotificationEmails = normalizeEmailList(values);

  const settings = await prisma.notificationSettings.upsert({
    where: { id: NOTIFICATION_SETTINGS_ID },
    update: { adminNotificationEmails },
    create: {
      id: NOTIFICATION_SETTINGS_ID,
      adminNotificationEmails,
    },
  });

  return normalizeEmailList(settings.adminNotificationEmails);
}
