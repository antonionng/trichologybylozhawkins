-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "enquiryNotificationStatus" TEXT;
ALTER TABLE "Contact" ADD COLUMN "enquiryNotificationError" TEXT;
ALTER TABLE "Contact" ADD COLUMN "enquiryNotificationAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CourseEnquiry" ADD COLUMN "notificationStatus" TEXT;
ALTER TABLE "CourseEnquiry" ADD COLUMN "notificationError" TEXT;
ALTER TABLE "CourseEnquiry" ADD COLUMN "notificationSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "digitalContentConsentAccepted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "digitalContentConsentAcceptedAt" TIMESTAMP(3);
