import { z } from "zod";

export const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().min(1),
  AZURE_OPENAI_ENDPOINT: z.string().url().optional().or(z.literal("")),
  AZURE_OPENAI_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

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

