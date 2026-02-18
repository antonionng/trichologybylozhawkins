import { Resend } from "resend";

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
  to: string;
  appUrl: string;
  conversationId: string;
  contactId: string;
  sessionId?: string | null;
  firstMessage: string;
  recentMessages?: { role: "user" | "assistant"; content: string }[] | null;
};

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || "Lorraine Hawkins <no-reply@trichologybylorrainehawkins.co.uk>";
}

export async function sendQuizResultEmail(input: QuizResultEmailInput) {
  const client = getResend();
  if (!client) return { skipped: true as const, reason: "Missing RESEND_API_KEY" };

  const subject = `${input.quizTitle} — your results (${Math.round(input.percentage)}%)`;
  const courseUrl = input.recommendedCourse
    ? `${input.appUrl}/academy/${encodeURIComponent(input.recommendedCourse.slug)}`
    : `${input.appUrl}/education`;

  const headline = input.aiFeedback?.headline || (input.passed ? "Congratulations!" : "Keep learning");
  const summary = input.aiFeedback?.summary || "";
  const nextSteps = Array.isArray(input.aiFeedback?.nextSteps) ? input.aiFeedback?.nextSteps : [];

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
    `Explore next steps: ${courseUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await client.emails.send({
    from: fromAddress(),
    to: input.to,
    subject,
    html,
    text,
  });

  return { skipped: false as const, id: res.data?.id ?? null };
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

  const res = await client.emails.send({
    from: fromAddress(),
    to: input.to,
    subject,
    html,
    text,
  });

  return { skipped: false as const, id: res.data?.id ?? null };
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

  const res = await client.emails.send({
    from: fromAddress(),
    to: input.to,
    subject,
    html,
    text,
  });

  return { skipped: false as const, id: res.data?.id ?? null };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

