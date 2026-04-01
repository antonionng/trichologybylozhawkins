import { Resend } from "resend";

type QuizResultEmailUpsellCourse = {
  title: string;
  slug: string;
  reason?: string;
};

type QuizResultEmailInput = {
  to: string;
  name: string;
  quizTitle: string;
  percentage: number;
  score: number;
  maxScore: number;
  passed: boolean;
  aiFeedback?: { headline?: string; summary?: string; nextSteps?: string[] } | null;
  recommendedCourse?: { title: string; slug: string } | null;
  /** Extra courses shown on the quiz results page (optional list in email). */
  recommendedCourses?: QuizResultEmailUpsellCourse[];
  appUrl: string;
};

type NewLeadEmailInput = {
  to: string;
  contactId: string;
  name: string;
  email: string;
  quizTitle: string;
  percentage: number;
  passed: boolean;
  aiHeadline?: string | null;
  appUrl: string;
};

type NewChatLeadEmailInput = {
  to: string | string[];
  appUrl: string;
  conversationId: string;
  contactId: string;
  sessionId?: string | null;
  firstMessage: string;
  recentMessages?: { role: "user" | "assistant"; content: string }[] | null;
};

type ShopOrderEmailItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
};

type ShopOrderConfirmationEmailInput = {
  to: string;
  appUrl: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  trackingUrl?: string | null;
  items: ShopOrderEmailItem[];
};

type ShopAdminOrderNotificationEmailInput = {
  to: string[];
  appUrl: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  statusLabel: string;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  trackingUrl?: string | null;
  items: ShopOrderEmailItem[];
};

type AcademySignupWelcomeEmailInput = {
  to: string;
  appUrl: string;
  firstName?: string;
  videoTitle?: string;
};

type EnquiryConfirmationEmailInput = {
  to: string;
  appUrl: string;
  firstName: string;
  enquiryType: string;
};

type AdminEnquiryNotificationEmailInput = {
  to: string[];
  appUrl: string;
  contactId: string;
  customerName: string;
  customerEmail: string;
  enquiryType: string;
  message: string;
  preferredContactMethod: string;
  urgency: string;
  company?: string;
  jobTitle?: string;
};

type CourseEnquiryConfirmationEmailInput = {
  to: string;
  appUrl: string;
  firstName: string;
  courseTitle: string;
};

type CourseEnquiryAdminEmailInput = {
  to: string[];
  appUrl: string;
  contactId: string;
  customerName: string;
  customerEmail: string;
  courseTitle: string;
  message?: string;
  phone?: string;
};

type EducationPurchaseEmailItem = {
  name: string;
  quantity: number;
  unitAmount: number;
  currency: string;
};

type EducationPurchaseConfirmationEmailInput = {
  to: string;
  appUrl: string;
  orderId: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  items: EducationPurchaseEmailItem[];
};

type EducationPurchaseAdminEmailInput = {
  to: string[];
  appUrl: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  items: EducationPurchaseEmailItem[];
};

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || "Lorraine Hawkins <no-reply@trichologybylorrainehawkins.co.uk>";
}

type ResendPayload = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
};

/**
 * Resend returns `{ data, error }` and does not throw on API errors (invalid from domain, etc.).
 * Without this check, callers assumed delivery succeeded.
 */
async function sendThroughResend(
  client: NonNullable<ReturnType<typeof getResend>>,
  payload: ResendPayload,
  context: string,
): Promise<string> {
  const result = await client.emails.send(payload);
  if (result.error) {
    const { message, name } = result.error;
    console.error(`[resend:${context}] API error`, { name, message });
    throw new Error(`Resend (${context}): ${message}`);
  }
  if (!result.data?.id) {
    console.error(`[resend:${context}] missing id in success response`, result);
    throw new Error(`Resend (${context}): no message id returned`);
  }
  return result.data.id;
}

export async function sendQuizResultEmail(input: QuizResultEmailInput) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `${input.quizTitle} - your results (${Math.round(input.percentage)}%)`;
  const courseUrl = input.recommendedCourse
    ? `${input.appUrl}/academy/${encodeURIComponent(input.recommendedCourse.slug)}`
    : `${input.appUrl}/education`;

  const headline = input.aiFeedback?.headline || (input.passed ? "Congratulations!" : "Keep learning");
  const summary = input.aiFeedback?.summary || "";
  const nextSteps = Array.isArray(input.aiFeedback?.nextSteps) ? input.aiFeedback?.nextSteps : [];
  const upsellCourses = Array.isArray(input.recommendedCourses) ? input.recommendedCourses : [];
  const upsellHtml =
    upsellCourses.length > 0
      ? `<div style="margin: 0 0 16px;">
          <p style="margin: 0 0 8px;"><strong>Courses you may like</strong></p>
          <ul style="margin: 0; padding-left: 18px;">
            ${upsellCourses
              .slice(0, 6)
              .map((c) => {
                const href = `${input.appUrl}/education/${encodeURIComponent(c.slug)}`;
                return `<li style="margin-bottom: 8px;">
                  <a href="${href}" style="color: #111; font-weight: 600;">${escapeHtml(c.title)}</a>
                  ${c.reason ? `<br/><span style="font-size: 13px; color: #555;">${escapeHtml(c.reason)}</span>` : ""}
                </li>`;
              })
              .join("")}
          </ul>
        </div>`
      : "";

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">${headline}</h2>
      <p style="margin: 0 0 16px;">
        Hi ${escapeHtml(input.name)},<br/>
        Your <strong>${escapeHtml(input.quizTitle)}</strong> result is <strong>${Math.round(input.percentage)}%</strong>
        (${input.score}/${input.maxScore}) — ${input.passed ? "<strong>passed</strong>." : "<strong>not passed yet</strong>."}
      </p>
      ${summary ? `<p style="margin: 0 0 16px;">${escapeHtml(summary)}</p>` : ""}
      ${
        nextSteps.length
          ? `<div style="margin: 0 0 16px;">
              <p style="margin: 0 0 8px;"><strong>Next steps</strong></p>
              <ul style="margin: 0; padding-left: 18px;">
                ${nextSteps.slice(0, 5).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
              </ul>
            </div>`
          : ""
      }
      <p style="margin: 0 0 18px;">
        ${input.recommendedCourse ? `Recommended: <strong>${escapeHtml(input.recommendedCourse.title)}</strong>` : "Explore the academy for structured next steps."}
      </p>
      ${upsellHtml}
      <p style="margin: 0;">
        <a href="${courseUrl}" style="display: inline-block; background: #fab826; color: #111; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          Explore next steps
        </a>
      </p>
      <p style="margin: 18px 0 0; font-size: 12px; color: #555;">
        If you didn’t request this, you can ignore this email.
      </p>
    </div>
  `.trim();

  const text = [
    headline,
    "",
    `Hi ${input.name},`,
    `Your ${input.quizTitle} result is ${Math.round(input.percentage)}% (${input.score}/${input.maxScore}) — ${input.passed ? "passed" : "not passed yet"}.`,
    summary ? "" : null,
    summary ? summary : null,
    nextSteps.length ? "" : null,
    nextSteps.length ? "Next steps:" : null,
    ...nextSteps.slice(0, 5).map((s) => `- ${s}`),
    "",
    upsellCourses.length ? "Courses you may like:" : null,
    ...upsellCourses.slice(0, 6).map((c) => {
      const line = `- ${c.title} (${input.appUrl}/education/${c.slug})`;
      return c.reason ? `${line}\n  ${c.reason}` : line;
    }),
    "",
    `Explore next steps: ${courseUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "quiz-result",
  );

  return { skipped: false as const, id };
}

export async function sendNewQuizLeadEmail(input: NewLeadEmailInput) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `New quiz lead: ${input.name} (${input.quizTitle})`;
  const contactUrl = `${input.appUrl}/dashboard/crm/contacts/${encodeURIComponent(input.contactId)}`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">New quiz contact captured</h2>
      <p style="margin: 0 0 10px;"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p style="margin: 0 0 10px;"><strong>Quiz:</strong> ${escapeHtml(input.quizTitle)}</p>
      <p style="margin: 0 0 16px;"><strong>Result:</strong> ${Math.round(input.percentage)}% — ${input.passed ? "Passed" : "Not passed"}</p>
      ${input.aiHeadline ? `<p style="margin: 0 0 16px;"><strong>AI headline:</strong> ${escapeHtml(input.aiHeadline)}</p>` : ""}
      <p style="margin: 0;">
        <a href="${contactUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          View contact in CRM
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    "New quiz contact captured",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Quiz: ${input.quizTitle}`,
    `Result: ${Math.round(input.percentage)}% — ${input.passed ? "Passed" : "Not passed"}`,
    input.aiHeadline ? `AI headline: ${input.aiHeadline}` : null,
    `CRM: ${contactUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "quiz-lead-admin",
  );

  return { skipped: false as const, id };
}

export async function sendNewChatLeadEmail(input: NewChatLeadEmailInput) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `New chat lead: ${input.conversationId}`;
  const contactUrl = `${input.appUrl}/dashboard/crm/contacts/${encodeURIComponent(input.contactId)}`;

  const transcript = Array.isArray(input.recentMessages) ? input.recentMessages.slice(0, 10) : [];
  const transcriptHtml = transcript.length
    ? `<div style="margin-top: 14px;">
        <p style="margin: 0 0 8px;"><strong>Recent chat</strong></p>
        <div style="border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 12px; background: rgba(0,0,0,0.02);">
          ${transcript
            .map(
              (m) =>
                `<p style="margin: 0 0 10px;"><strong>${escapeHtml(
                  m.role === "user" ? "User" : "Assistant"
                )}:</strong> ${escapeHtml(m.content)}</p>`
            )
            .join("")}
        </div>
      </div>`
    : "";

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">New chat started</h2>
      <p style="margin: 0 0 10px;"><strong>Conversation ID:</strong> ${escapeHtml(
        input.conversationId
      )}</p>
      <p style="margin: 0 0 10px;"><strong>Session ID:</strong> ${
        input.sessionId ? escapeHtml(input.sessionId) : "—"
      }</p>
      <p style="margin: 0 0 16px;"><strong>First message:</strong> ${escapeHtml(
        input.firstMessage
      )}</p>
      <p style="margin: 0;">
        <a href="${contactUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          View contact in CRM
        </a>
      </p>
      ${transcriptHtml}
    </div>
  `.trim();

  const text = [
    "New chat started",
    `Conversation ID: ${input.conversationId}`,
    input.sessionId ? `Session ID: ${input.sessionId}` : null,
    "",
    `First message: ${input.firstMessage}`,
    "",
    `CRM: ${contactUrl}`,
    transcript.length ? "" : null,
    transcript.length ? "Recent chat:" : null,
    ...transcript.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`),
  ]
    .filter(Boolean)
    .join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "chat-lead-admin",
  );

  return { skipped: false as const, id };
}

export async function sendEnquiryConfirmationEmail(
  input: EnquiryConfirmationEmailInput,
) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = "We received your enquiry";
  const replyUrl = `${input.appUrl}/contact`;
  const enquiryLabel = input.enquiryType.replace(/_/g, " ");
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">Thanks for getting in touch</h2>
      <p style="margin: 0 0 16px;">Hi ${escapeHtml(input.firstName)},<br/>We’ve received your ${escapeHtml(enquiryLabel)} enquiry and will be in touch within 24 to 48 hours.</p>
      <p style="margin: 0;">
        <a href="${replyUrl}" style="display: inline-block; background: #fab826; color: #111; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          Visit contact page
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    "Thanks for getting in touch",
    "",
    `Hi ${input.firstName},`,
    `We’ve received your ${enquiryLabel} enquiry and will be in touch within 24 to 48 hours.`,
    "",
    `Contact page: ${replyUrl}`,
  ].join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "enquiry-confirmation",
  );

  return { skipped: false as const, id };
}

export async function sendAdminEnquiryNotificationEmail(
  input: AdminEnquiryNotificationEmailInput,
) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `New enquiry: ${input.customerName}`;
  const contactUrl = `${input.appUrl}/dashboard/crm/contacts/${encodeURIComponent(input.contactId)}`;
  const extraFields = [
    input.company ? `<p style="margin: 0 0 10px;"><strong>Company:</strong> ${escapeHtml(input.company)}</p>` : "",
    input.jobTitle ? `<p style="margin: 0 0 10px;"><strong>Job title:</strong> ${escapeHtml(input.jobTitle)}</p>` : "",
  ].join("");
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">New enquiry received</h2>
      <p style="margin: 0 0 10px;"><strong>Name:</strong> ${escapeHtml(input.customerName)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(input.customerEmail)}</p>
      <p style="margin: 0 0 10px;"><strong>Type:</strong> ${escapeHtml(input.enquiryType)}</p>
      <p style="margin: 0 0 10px;"><strong>Preferred contact:</strong> ${escapeHtml(input.preferredContactMethod)}</p>
      <p style="margin: 0 0 16px;"><strong>Urgency:</strong> ${escapeHtml(input.urgency)}</p>
      ${extraFields}
      <p style="margin: 0 0 16px;"><strong>Message:</strong><br/>${escapeHtml(input.message)}</p>
      <p style="margin: 0;">
        <a href="${contactUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          View contact in CRM
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    "New enquiry received",
    `Name: ${input.customerName}`,
    `Email: ${input.customerEmail}`,
    `Type: ${input.enquiryType}`,
    `Preferred contact: ${input.preferredContactMethod}`,
    `Urgency: ${input.urgency}`,
    input.company ? `Company: ${input.company}` : null,
    input.jobTitle ? `Job title: ${input.jobTitle}` : null,
    "",
    `Message: ${input.message}`,
    "",
    `CRM: ${contactUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "enquiry-admin",
  );

  return { skipped: false as const, id };
}

export async function sendCourseEnquiryConfirmationEmail(
  input: CourseEnquiryConfirmationEmailInput,
) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `We received your enquiry about ${input.courseTitle}`;
  const educationUrl = `${input.appUrl}/education`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">Thanks for your course enquiry</h2>
      <p style="margin: 0 0 16px;">Hi ${escapeHtml(input.firstName)},<br/>We’ve received your enquiry about <strong>${escapeHtml(input.courseTitle)}</strong> and will follow up shortly.</p>
      <p style="margin: 0;">
        <a href="${educationUrl}" style="display: inline-block; background: #fab826; color: #111; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          Browse education
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    "Thanks for your course enquiry",
    "",
    `Hi ${input.firstName},`,
    `We’ve received your enquiry about ${input.courseTitle} and will follow up shortly.`,
    "",
    `Education: ${educationUrl}`,
  ].join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "course-enquiry-confirmation",
  );

  return { skipped: false as const, id };
}

export async function sendCourseEnquiryAdminEmail(
  input: CourseEnquiryAdminEmailInput,
) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `Course enquiry: ${input.courseTitle}`;
  const contactUrl = `${input.appUrl}/dashboard/crm/contacts/${encodeURIComponent(input.contactId)}`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">New course enquiry</h2>
      <p style="margin: 0 0 10px;"><strong>Course:</strong> ${escapeHtml(input.courseTitle)}</p>
      <p style="margin: 0 0 10px;"><strong>Name:</strong> ${escapeHtml(input.customerName)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(input.customerEmail)}</p>
      ${input.phone ? `<p style="margin: 0 0 10px;"><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>` : ""}
      ${input.message ? `<p style="margin: 0 0 16px;"><strong>Message:</strong><br/>${escapeHtml(input.message)}</p>` : ""}
      <p style="margin: 0;">
        <a href="${contactUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          View contact in CRM
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    "New course enquiry",
    `Course: ${input.courseTitle}`,
    `Name: ${input.customerName}`,
    `Email: ${input.customerEmail}`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.message ? "" : null,
    input.message ? `Message: ${input.message}` : null,
    "",
    `CRM: ${contactUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "course-enquiry-admin",
  );

  return { skipped: false as const, id };
}

export async function sendAcademySignupWelcomeEmail(input: AcademySignupWelcomeEmailInput) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = "Welcome to the academy";
  const academyUrl = `${input.appUrl}/academy`;
  const greeting = input.firstName ? `Hi ${input.firstName},` : "Hello,";
  const bonusLine = input.videoTitle
    ? `Your free welcome lesson, ${input.videoTitle}, is now waiting for you in the academy.`
    : "Your academy access is ready.";

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">Welcome to Lorraine Hawkins Academy</h2>
      <p style="margin: 0 0 16px;">${escapeHtml(greeting)}<br/>${escapeHtml(bonusLine)}</p>
      <p style="margin: 0 0 16px;">You can now sign in to view your training and continue your learning journey.</p>
      <p style="margin: 0;">
        <a href="${academyUrl}" style="display: inline-block; background: #fab826; color: #111; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          Go to the academy
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    "Welcome to Lorraine Hawkins Academy",
    "",
    greeting,
    bonusLine,
    "You can now sign in to view your training and continue your learning journey.",
    "",
    `Academy: ${academyUrl}`,
  ].join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "academy-signup-welcome",
  );

  return { skipped: false as const, id };
}

export async function sendEducationPurchaseConfirmationEmail(
  input: EducationPurchaseConfirmationEmailInput,
) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `Education purchase confirmed: ${input.orderId}`;
  const academyUrl = `${input.appUrl}/academy`;
  const itemListHtml = renderEducationItemsHtml(input.items);
  const itemListText = renderEducationItemsText(input.items);

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">Thanks for your purchase</h2>
      <p style="margin: 0 0 16px;">
        Hi ${escapeHtml(input.customerName)},<br/>
        Your education order <strong>${escapeHtml(input.orderId)}</strong> has been confirmed.
      </p>
      <div style="margin: 0 0 16px;">
        <p style="margin: 0 0 8px;"><strong>Items</strong></p>
        ${itemListHtml}
      </div>
      <p style="margin: 0 0 18px;"><strong>Total:</strong> ${escapeHtml(formatMoney(input.currency, input.totalAmount))}</p>
      <p style="margin: 0;">
        <a href="${academyUrl}" style="display: inline-block; background: #fab826; color: #111; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          Open the academy
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    "Thanks for your purchase",
    "",
    `Hi ${input.customerName},`,
    `Your education order ${input.orderId} has been confirmed.`,
    "",
    "Items:",
    itemListText,
    "",
    `Total: ${formatMoney(input.currency, input.totalAmount)}`,
    "",
    `Academy: ${academyUrl}`,
  ].join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "education-purchase-confirmation",
  );

  return { skipped: false as const, id };
}

export async function sendEducationPurchaseAdminEmail(
  input: EducationPurchaseAdminEmailInput,
) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `Education purchase: ${input.orderId}`;
  const orderUrl = `${input.appUrl}/dashboard/crm/contacts`;
  const itemListHtml = renderEducationItemsHtml(input.items);
  const itemListText = renderEducationItemsText(input.items);

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">New education purchase</h2>
      <p style="margin: 0 0 10px;"><strong>Order:</strong> ${escapeHtml(input.orderId)}</p>
      <p style="margin: 0 0 10px;"><strong>Customer:</strong> ${escapeHtml(input.customerName)}</p>
      <p style="margin: 0 0 16px;"><strong>Email:</strong> ${escapeHtml(input.customerEmail)}</p>
      <div style="margin: 0 0 16px;">
        <p style="margin: 0 0 8px;"><strong>Items</strong></p>
        ${itemListHtml}
      </div>
      <p style="margin: 0 0 18px;"><strong>Total:</strong> ${escapeHtml(formatMoney(input.currency, input.totalAmount))}</p>
      <p style="margin: 0;">
        <a href="${orderUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          Open CRM
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    "New education purchase",
    `Order: ${input.orderId}`,
    `Customer: ${input.customerName}`,
    `Email: ${input.customerEmail}`,
    "",
    "Items:",
    itemListText,
    "",
    `Total: ${formatMoney(input.currency, input.totalAmount)}`,
    "",
    `CRM: ${orderUrl}`,
  ].join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "education-purchase-admin",
  );

  return { skipped: false as const, id };
}

export async function sendShopOrderConfirmationEmail(input: ShopOrderConfirmationEmailInput) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `Order confirmed: ${input.orderId}`;
  const shopUrl = `${input.appUrl}/shop`;
  const lineItemsHtml = renderOrderItemsHtml(input.items);
  const lineItemsText = renderOrderItemsText(input.items);
  const totalsText = renderOrderTotalsText(input.currency, input.subtotalAmount, input.shippingAmount, input.totalAmount);
  const trackingMarkup = input.trackingUrl
    ? `<p style="margin: 16px 0 0;"><a href="${input.trackingUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">Track your order</a></p>`
    : "";
  const trackingText = input.trackingUrl ? `Tracking: ${input.trackingUrl}` : null;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">Thanks for your order</h2>
      <p style="margin: 0 0 16px;">
        Hi ${escapeHtml(input.customerName)},<br/>
        Your order <strong>${escapeHtml(input.orderId)}</strong> has been confirmed.
      </p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(input.customerEmail)}</p>
      <div style="margin: 0 0 16px;">
        <p style="margin: 0 0 8px;"><strong>Items</strong></p>
        ${lineItemsHtml}
      </div>
      <p style="margin: 0 0 6px;"><strong>Subtotal:</strong> ${escapeHtml(formatMoney(input.currency, input.subtotalAmount))}</p>
      <p style="margin: 0 0 6px;"><strong>Shipping:</strong> ${escapeHtml(formatMoney(input.currency, input.shippingAmount))}</p>
      <p style="margin: 0 0 18px;"><strong>Total:</strong> ${escapeHtml(formatMoney(input.currency, input.totalAmount))}</p>
      <p style="margin: 0 0 18px;">
        <a href="${shopUrl}" style="display: inline-block; background: #fab826; color: #111; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          Continue shopping
        </a>
      </p>
      ${trackingMarkup}
    </div>
  `.trim();

  const text = [
    "Thanks for your order",
    "",
    `Hi ${input.customerName},`,
    `Your order ${input.orderId} has been confirmed.`,
    `Email: ${input.customerEmail}`,
    "",
    "Items:",
    lineItemsText,
    "",
    totalsText,
    trackingText,
    "",
    `Shop: ${shopUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "shop-order-confirmation",
  );

  return { skipped: false as const, id };
}

export async function sendShopAdminOrderNotificationEmail(input: ShopAdminOrderNotificationEmailInput) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `${input.statusLabel}: ${input.orderId}`;
  const orderUrl = `${input.appUrl}/dashboard/shop/orders/${encodeURIComponent(input.orderId)}`;
  const lineItemsHtml = renderOrderItemsHtml(input.items);
  const lineItemsText = renderOrderItemsText(input.items);
  const totalsText = renderOrderTotalsText(input.currency, input.subtotalAmount, input.shippingAmount, input.totalAmount);
  const trackingHtml = input.trackingUrl
    ? `<p style="margin: 0 0 16px;"><strong>Tracking:</strong> <a href="${input.trackingUrl}">${escapeHtml(input.trackingUrl)}</a></p>`
    : "";
  const trackingText = input.trackingUrl ? `Tracking: ${input.trackingUrl}` : null;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.45; color: #111;">
      <h2 style="margin: 0 0 12px;">${escapeHtml(input.statusLabel)}</h2>
      <p style="margin: 0 0 10px;"><strong>Order:</strong> ${escapeHtml(input.orderId)}</p>
      <p style="margin: 0 0 10px;"><strong>Customer:</strong> ${escapeHtml(input.customerName)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(input.customerEmail)}</p>
      ${trackingHtml}
      <div style="margin: 0 0 16px;">
        <p style="margin: 0 0 8px;"><strong>Items</strong></p>
        ${lineItemsHtml}
      </div>
      <p style="margin: 0 0 6px;"><strong>Subtotal:</strong> ${escapeHtml(formatMoney(input.currency, input.subtotalAmount))}</p>
      <p style="margin: 0 0 6px;"><strong>Shipping:</strong> ${escapeHtml(formatMoney(input.currency, input.shippingAmount))}</p>
      <p style="margin: 0 0 18px;"><strong>Total:</strong> ${escapeHtml(formatMoney(input.currency, input.totalAmount))}</p>
      <p style="margin: 0;">
        <a href="${orderUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 600;">
          View order
        </a>
      </p>
    </div>
  `.trim();

  const text = [
    input.statusLabel,
    `Order: ${input.orderId}`,
    `Customer: ${input.customerName}`,
    `Email: ${input.customerEmail}`,
    trackingText,
    "",
    "Items:",
    lineItemsText,
    "",
    totalsText,
    "",
    `Order admin: ${orderUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const id = await sendThroughResend(
    client,
    { from: fromAddress(), to: input.to, subject, html, text },
    "shop-order-admin",
  );

  return { skipped: false as const, id };
}

function renderOrderItemsHtml(items: ShopOrderEmailItem[]) {
  return `
    <ul style="margin: 0; padding-left: 18px;">
      ${items
        .map(
          (item) =>
            `<li>${escapeHtml(item.productName)} x${item.quantity} (${escapeHtml(
              formatMoney(item.currency, item.unitPrice)
            )})</li>`
        )
        .join("")}
    </ul>
  `.trim();
}

function renderOrderItemsText(items: ShopOrderEmailItem[]) {
  return items
    .map((item) => `- ${item.productName} x${item.quantity} (${formatMoney(item.currency, item.unitPrice)})`)
    .join("\n");
}

function renderOrderTotalsText(currency: string, subtotalAmount: number, shippingAmount: number, totalAmount: number) {
  return [
    `Subtotal: ${formatMoney(currency, subtotalAmount)}`,
    `Shipping: ${formatMoney(currency, shippingAmount)}`,
    `Total: ${formatMoney(currency, totalAmount)}`,
  ].join("\n");
}

function renderEducationItemsHtml(items: EducationPurchaseEmailItem[]) {
  return `
    <ul style="margin: 0; padding-left: 18px;">
      ${items
        .map(
          (item) =>
            `<li>${escapeHtml(item.name)} x${item.quantity} (${escapeHtml(
              formatMoney(item.currency, item.unitAmount)
            )})</li>`
        )
        .join("")}
    </ul>
  `.trim();
}

function renderEducationItemsText(items: EducationPurchaseEmailItem[]) {
  return items
    .map((item) => `- ${item.name} x${item.quantity} (${formatMoney(item.currency, item.unitAmount)})`)
    .join("\n");
}

function formatMoney(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

