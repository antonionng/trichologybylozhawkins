import { serverEnvironmentSchema } from "@/server/schema/env";

const validBaseEnv = {
  DATABASE_URL: "https://db.example.com",
  REDIS_URL: "redis://localhost:6379",
  OPENAI_API_KEY: "openai-key",
  AUTH_SECRET: "1234567890123456",
  SUPABASE_URL: "https://supabase.example.com",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  SUPABASE_STORAGE_BUCKET: "education-assets",
  NEXT_PUBLIC_APP_URL: "https://app.example.com",
};

describe("serverEnvironmentSchema (production)", () => {
  it("requires Stripe keys in production", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const parsed = serverEnvironmentSchema.safeParse(validBaseEnv);
    expect(parsed.success).toBe(false);

    process.env.NODE_ENV = previousNodeEnv;
  });

  it("accepts Stripe keys in production", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const parsed = serverEnvironmentSchema.safeParse({
      ...validBaseEnv,
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      RESEND_API_KEY: "re_test_123",
    });
    expect(parsed.success).toBe(true);

    process.env.NODE_ENV = previousNodeEnv;
  });
});
