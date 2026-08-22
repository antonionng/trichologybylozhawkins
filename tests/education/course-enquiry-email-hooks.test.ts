import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const courseFindUniqueMock = vi.fn();
const contactUpsertMock = vi.fn();
const courseEnquiryCreateMock = vi.fn();
const activityCreateMock = vi.fn();
const taskCreateMock = vi.fn();
const getEnquiryAdminRecipientsMock = vi.fn();
const sendCourseEnquiryConfirmationEmailMock = vi.fn();
const sendCourseEnquiryAdminEmailMock = vi.fn();

vi.mock("@/server/modules/settings/notifications", () => ({
  getEnquiryAdminRecipients: getEnquiryAdminRecipientsMock,
}));

vi.mock("@/server/modules/email/transactional", () => ({
  sendCourseEnquiryConfirmationEmail: sendCourseEnquiryConfirmationEmailMock,
  sendCourseEnquiryAdminEmail: sendCourseEnquiryAdminEmailMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    course: {
      findUnique: courseFindUniqueMock,
    },
    contact: {
      upsert: contactUpsertMock,
    },
    $transaction: async (callback: (tx: any) => Promise<unknown>) =>
      callback({
        courseEnquiry: {
          create: courseEnquiryCreateMock,
        },
        activity: {
          create: activityCreateMock,
        },
        task: {
          create: taskCreateMock,
        },
      }),
  },
}));

vi.mock("@/server/schema", () => ({
  checkoutSessionSchema: z.object({}),
  courseEnquirySchema: z.object({
    courseId: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    message: z.string().optional(),
    source: z.string().optional(),
    consentToMarketing: z.boolean().default(false),
  }),
  courseLessonSchema: z.object({}),
  courseModuleSchema: z.object({}),
  coursePriceSchema: z.object({}),
  courseSessionSchema: z.object({}),
  courseUpsertSchema: z.object({}),
  enrollmentUpdateSchema: z.object({}),
  getServerEnv: vi.fn(() => ({ NEXT_PUBLIC_APP_URL: "https://example.com" })),
  videoProductPriceSchema: z.object({}),
  videoProductUpsertSchema: z.object({}),
}));

vi.mock("@prisma/client", () => ({
  EnrollmentStatus: { ACTIVE: "ACTIVE" },
  PaymentEventType: {
    PAYMENT_SUCCEEDED: "PAYMENT_SUCCEEDED",
    PAYMENT_FAILED: "PAYMENT_FAILED",
  },
}));

describe("course enquiry email hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    courseFindUniqueMock.mockResolvedValue({
      id: "course_1",
      title: "Advanced Trichology",
    });
    contactUpsertMock.mockResolvedValue({
      id: "contact_1",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
    });
    courseEnquiryCreateMock.mockResolvedValue({
      id: "enquiry_1",
      dealId: null,
    });
    activityCreateMock.mockResolvedValue(undefined);
    taskCreateMock.mockResolvedValue(undefined);
    getEnquiryAdminRecipientsMock.mockResolvedValue([
      "loz.hawkins95@gmail.com",
      "ag@experrt.com",
      "ops@example.com",
    ]);
    sendCourseEnquiryConfirmationEmailMock.mockResolvedValue({
      skipped: false,
      id: "msg_1",
    });
    sendCourseEnquiryAdminEmailMock.mockResolvedValue({
      skipped: false,
      id: "msg_2",
    });
  });

  it("sends customer and admin emails after creating a course enquiry", async () => {
    const { createCourseEnquiry } = await import("@/server/modules/education/service");

    await createCourseEnquiry({
      courseId: "course_1",
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "01234 567890",
      message: "Can you recommend the right course for my team?",
      consentToMarketing: true,
    });

    expect(sendCourseEnquiryConfirmationEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jane@example.com",
        firstName: "Jane",
        courseTitle: "Advanced Trichology",
      }),
    );
    expect(getEnquiryAdminRecipientsMock).toHaveBeenCalledTimes(1);
    expect(sendCourseEnquiryAdminEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["loz.hawkins95@gmail.com", "ag@experrt.com", "ops@example.com"],
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        courseTitle: "Advanced Trichology",
      }),
    );
  });
});
