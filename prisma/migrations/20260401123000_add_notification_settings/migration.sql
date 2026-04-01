-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminNotificationEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);
