import { z } from "zod";

const serverEnvSchema = z.object({
  // : z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  MOLLIE_API_KEY: z.string().min(1, "MOLLIE_API_KEY is required"),
  MOLLIE_WEBHOOK_URL: z.url("MOLLIE_WEBHOOK_URL must be a valid URL"),
  BREVO_API_KEY: z.string().min(1, "BREVO_API_KEY is required"),
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "BLOB_READ_WRITE_TOKEN is required"),
  SENTRY_DSN: z.url("SENTRY_DSN must be a valid URL"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_COOKIEBOT_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url("NEXT_PUBLIC_SENTRY_DSN must be a valid URL"),
});

const serverEnvResult = serverEnvSchema.safeParse(process.env);
const clientEnvResult = clientEnvSchema.safeParse(process.env);

if (!serverEnvResult.success) {
  const formattedErrors = JSON.stringify(serverEnvResult.error.flatten().fieldErrors, null, 2);
  throw new Error(`Invalid server environment variables:\n${formattedErrors}`);
}

if (!clientEnvResult.success) {
  const formattedErrors = JSON.stringify(clientEnvResult.error.flatten().fieldErrors, null, 2);
  throw new Error(`Invalid client environment variables:\n${formattedErrors}`);
}

export const env = {
  ...serverEnvResult.data,
  ...clientEnvResult.data,
};
