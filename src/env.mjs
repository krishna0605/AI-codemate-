import { z } from 'zod';

const envSchema = z.object({
  // Server-side
  DATABASE_URL: z.string().url(),
  
  // Auth
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  
  // AI
  GEMINI_API_KEY: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Monitoring & Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Client-side (must start with NEXT_PUBLIC_)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  // Throwing error here will fail the build if env vars are missing
  if (process.env.NODE_ENV !== 'test') { // Allow tests to mock env
     throw new Error('Invalid environment variables');
  }
}

export const env = _env.success ? _env.data : {};
