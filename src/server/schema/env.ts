import { z } from "zod";
const DEV_FALLBACK_AUTH_SECRET = "dev-auth-secret-please-change"; // stable dev fallback (min 16 chars)

const serverEnvironmentSchemaBase = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  // Email (Resend)
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().min(1).optional(),
  CHAT_ADMIN_NOTIFY_EMAIL: z.string().email().optional(),
  // Used to sign/verify session cookies. Required in production; dev can fall back.
  AUTH_SECRET: z.string().min(16).optional(),
  // Compatibility alias (e.g. NextAuth setups).
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  ADMIN_BOOTSTRAP_TOKEN: z.string().optional(),
  // OpenAI configuration (required in production unless you explicitly skip env validation).
  OPENAI_API_KEY: z.string().min(1).optional(),
  AZURE_OPENAI_ENDPOINT: z.string().url().optional().or(z.literal("")),
  AZURE_OPENAI_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  DEV_SKIP_CHECKOUT: z.enum(["true", "false"]).optional(),
});

export const serverEnvironmentSchema = serverEnvironmentSchemaBase
  .superRefine((value, ctx) => {
    const isProd = process.env.NODE_ENV === "production";

    // Only enforce OpenAI in production. Local dev can run without AI wired up.
    if (isProd && !value.OPENAI_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OPENAI_API_KEY"],
        message: "Missing OPENAI_API_KEY.",
      });
    }

    // AUTH_SECRET is required in production, but allow a dev fallback.
    if (isProd && !value.AUTH_SECRET && !value.NEXTAUTH_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_SECRET"],
        message: "Missing AUTH_SECRET (or NEXTAUTH_SECRET).",
      });
    }

    if (isProd && value.DEV_SKIP_CHECKOUT === "true") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DEV_SKIP_CHECKOUT"],
        message: "DEV_SKIP_CHECKOUT must be false in production.",
      });
    }

    if (isProd && !value.STRIPE_SECRET_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STRIPE_SECRET_KEY"],
        message: "Missing STRIPE_SECRET_KEY in production.",
      });
    }

    if (isProd && !value.STRIPE_WEBHOOK_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STRIPE_WEBHOOK_SECRET"],
        message: "Missing STRIPE_WEBHOOK_SECRET in production.",
      });
    }

    if (isProd && !value.RESEND_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["RESEND_API_KEY"],
        message: "Missing RESEND_API_KEY in production.",
      });
    }
  })
  .transform((value) => ({
    ...value,
    AUTH_SECRET:
      value.AUTH_SECRET ??
      value.NEXTAUTH_SECRET ??
      (process.env.NODE_ENV === "production" ? "" : DEV_FALLBACK_AUTH_SECRET),
  }));

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

let cachedEnv: ServerEnvironment | null = null;

export const getServerEnv = (): ServerEnvironment => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = serverEnvironmentSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables: ${parsed.error.toString()}`
    );
  }

  cachedEnv = parsed.data;
  return cachedEnv;
};

