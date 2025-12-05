import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  SERVICE_API_TOKEN: z.string().min(16, 'SERVICE_API_TOKEN must be at least 16 characters'),

  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10).optional(),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Gemini API Keys (up to 25)
  GEMINI_API_KEY_1: z.string().optional(),
  GEMINI_API_KEY_2: z.string().optional(),
  GEMINI_API_KEY_3: z.string().optional(),
  GEMINI_API_KEY_4: z.string().optional(),
  GEMINI_API_KEY_5: z.string().optional(),
  GEMINI_API_KEY_6: z.string().optional(),
  GEMINI_API_KEY_7: z.string().optional(),
  GEMINI_API_KEY_8: z.string().optional(),
  GEMINI_API_KEY_9: z.string().optional(),
  GEMINI_API_KEY_10: z.string().optional(),
  GEMINI_API_KEY_11: z.string().optional(),
  GEMINI_API_KEY_12: z.string().optional(),
  GEMINI_API_KEY_13: z.string().optional(),
  GEMINI_API_KEY_14: z.string().optional(),
  GEMINI_API_KEY_15: z.string().optional(),
  GEMINI_API_KEY_16: z.string().optional(),
  GEMINI_API_KEY_17: z.string().optional(),
  GEMINI_API_KEY_18: z.string().optional(),
  GEMINI_API_KEY_19: z.string().optional(),
  GEMINI_API_KEY_20: z.string().optional(),
  GEMINI_API_KEY_21: z.string().optional(),
  GEMINI_API_KEY_22: z.string().optional(),
  GEMINI_API_KEY_23: z.string().optional(),
  GEMINI_API_KEY_24: z.string().optional(),
  GEMINI_API_KEY_25: z.string().optional(),

  // Speechify API Keys (up to 8)
  SPEECHIFY_API_KEY_1: z.string().optional(),
  SPEECHIFY_API_KEY_2: z.string().optional(),
  SPEECHIFY_API_KEY_3: z.string().optional(),
  SPEECHIFY_API_KEY_4: z.string().optional(),
  SPEECHIFY_API_KEY_5: z.string().optional(),
  SPEECHIFY_API_KEY_6: z.string().optional(),
  SPEECHIFY_API_KEY_7: z.string().optional(),
  SPEECHIFY_API_KEY_8: z.string().optional(),

  // SearchAPI Keys (up to 5)
  SEARCHAPI_KEY_1: z.string().optional(),
  SEARCHAPI_KEY_2: z.string().optional(),
  SEARCHAPI_KEY_3: z.string().optional(),
  SEARCHAPI_KEY_4: z.string().optional(),
  SEARCHAPI_KEY_5: z.string().optional(),

  // Other API Keys
  PDF_CO_API_KEY: z.string().optional(),
  CLIPDROP_API_KEY: z.string().optional(),
  HANDWRITING_API_KEY: z.string().optional(),
  STABILITY_API_KEY: z.string().optional(),

  // Database URLs
  NEON_DB_URL: z.string().optional(),
  FEEDBACKS_DB_SERVICE_KEY: z.string().optional()
});

export type AppConfig = z.infer<typeof EnvSchema>;

export const loadConfig = (): AppConfig => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment configuration');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
  }
  return parsed.data;
};

