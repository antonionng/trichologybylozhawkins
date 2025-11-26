import { NextResponse } from "next/server";
import { upsertContact, logActivity, upsertTask } from "@/server/modules/crm/service";
import { z } from "zod";
import { LifecycleStage, ActivityType, TaskPriority, TaskStatus } from "@prisma/client";

const enquirySchema = z.object({
  enquiryType: z.enum(["clinic", "education", "press", "other"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  message: z.string().min(10, "Please provide more details (at least 10 characters)"),
  preferredContactMethod: z.enum(["email", "phone", "either"]).default("email"),
  urgency: z.enum(["low", "normal", "high"]).default("normal"),
  consentToMarketing: z.boolean().default(false),
  source: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = enquirySchema.parse(body);

    // Build notes with company info if provided
    const notesParts = [data.message];
    if (data.company) {
      notesParts.unshift(`Company: ${data.company}`);
    }

    // Create or update contact
    const contact = await upsertContact({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      jobTitle: data.jobTitle,
      source: data.source || `enquiry_${data.enquiryType}`,
      lifecycleStage: LifecycleStage.LEAD,
      notes: notesParts.join('\n\n'),
    });

    // Log activity
    await logActivity({
      type: ActivityType.EMAIL,
      subject: `New ${data.enquiryType} enquiry from ${data.firstName} ${data.lastName}`,
      body: `Enquiry Type: ${data.enquiryType}\n\nMessage:\n${data.message}\n\nPreferred Contact: ${data.preferredContactMethod}\nUrgency: ${data.urgency}\n${data.company ? `Company: ${data.company}\n` : ""}${data.jobTitle ? `Job Title: ${data.jobTitle}\n` : ""}`,
      contactId: contact.id,
      outcome: data.urgency === "high" ? undefined : undefined,
    });

    // Create follow-up task if high urgency
    if (data.urgency === "high") {
      await upsertTask({
        title: `Follow up: ${data.enquiryType} enquiry from ${data.firstName} ${data.lastName}`,
        description: `Contact: ${data.preferredContactMethod === "phone" ? data.phone : data.email}\n\n${data.message}`,
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        contactId: contact.id,
      });
    }

    return NextResponse.json({
      success: true,
      contactId: contact.id,
      message: "Your enquiry has been received. We'll be in touch within 24-48 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to submit enquiry",
      },
      { status: 500 }
    );
  }
}

