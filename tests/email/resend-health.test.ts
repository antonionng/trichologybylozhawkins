import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/modules/email/transactional", () => ({
  DEFAULT_RESEND_FROM_EMAIL: "Lorraine Hawkins <no-reply@trichologybylorrainehawkins.co.uk>",
  getResendFromAddress: () =>
    process.env.RESEND_FROM_EMAIL ||
    "Lorraine Hawkins <no-reply@trichologybylorrainehawkins.co.uk>",
}));

const domainsListMock = vi.fn();
const emailsSendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    domains = { list: domainsListMock };
    emails = { send: emailsSendMock };
  },
}));

describe("Resend health check", () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("reports a missing API key as the likely cause", async () => {
    const { probeResendHealth } = await import("@/server/modules/email/resend-health");
    const report = await probeResendHealth();

    expect(report.ok).toBe(false);
    expect(report.likelyCause).toBe("RESEND_API_KEY");
    expect(report.summary).toContain("RESEND_API_KEY");
  });

  it("reports an unverified from domain as RESEND_FROM_EMAIL", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "Lorraine Hawkins <noreply@trichologyacademy.com>";
    process.env.NEXT_PUBLIC_APP_URL = "https://trichologyacademy.co.uk";
    domainsListMock.mockResolvedValueOnce({
      data: {
        data: [{ name: "trichologyacademy.co.uk", status: "verified" }],
      },
      error: null,
    });

    const { probeResendHealth } = await import("@/server/modules/email/resend-health");
    const report = await probeResendHealth();

    expect(report.ok).toBe(false);
    expect(report.likelyCause).toBe("RESEND_FROM_EMAIL");
    expect(report.fromDomain).toBe("trichologyacademy.com");
    expect(report.fromDomainMatchesSite).toBe(false);
    expect(report.resendError).toContain("unverified domain trichologyacademy.com");
  });

  it("returns the Resend send error when a probe fails", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "Lorraine Hawkins <noreply@trichologyacademy.com>";
    domainsListMock.mockResolvedValueOnce({
      data: { data: [{ name: "trichologyacademy.com", status: "verified" }] },
      error: null,
    });
    emailsSendMock.mockResolvedValueOnce({
      data: null,
      error: { name: "validation_error", message: "The trichologyacademy.com domain is not verified." },
    });

    const { probeResendHealth } = await import("@/server/modules/email/resend-health");
    const report = await probeResendHealth({
      sendProbe: true,
      probeTo: "ops@example.com",
    });

    expect(report.ok).toBe(false);
    expect(report.likelyCause).toBe("RESEND_FROM_EMAIL");
    expect(report.resendError).toContain("domain is not verified");
  });

  it("treats a 403 unverified-domain send error as RESEND_FROM_EMAIL", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "Lorraine Hawkins <noreply@trichologyacademy.com>";
    domainsListMock.mockResolvedValueOnce({
      data: { data: [] },
      error: null,
    });
    emailsSendMock.mockResolvedValueOnce({
      data: null,
      error: {
        name: "validation_error",
        statusCode: 403,
        message:
          "The trichologyacademy.com domain is not verified. Please, add and verify your domain on https://resend.com/domains",
      },
    });

    const { probeResendHealth } = await import("@/server/modules/email/resend-health");
    const report = await probeResendHealth({
      sendProbe: true,
      probeTo: "ops@example.com",
    });

    expect(report.likelyCause).toBe("RESEND_FROM_EMAIL");
    expect(report.resendError).toContain("HTTP 403");
  });
});
