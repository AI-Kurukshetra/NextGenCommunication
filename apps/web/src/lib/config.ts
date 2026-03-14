import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CPAAS_WEBHOOK_SIGNING_SECRET: z.string().min(1),
  CPAAS_DEFAULT_SMS_PROVIDER: z.string().default("mock"),
  CPAAS_DEFAULT_VOICE_PROVIDER: z.string().default("mock"),
  CPAAS_APP_URL: z.string().url().default("http://localhost:3000")
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CPAAS_WEBHOOK_SIGNING_SECRET: process.env.CPAAS_WEBHOOK_SIGNING_SECRET,
  CPAAS_DEFAULT_SMS_PROVIDER: process.env.CPAAS_DEFAULT_SMS_PROVIDER,
  CPAAS_DEFAULT_VOICE_PROVIDER: process.env.CPAAS_DEFAULT_VOICE_PROVIDER,
  CPAAS_APP_URL: process.env.CPAAS_APP_URL
});
