import { z } from 'zod';

export const authCallbackSchema = z.object({
  code: z.string().min(1),
  next: z.string().default('/editor'),
});

export type AuthCallbackSchema = z.infer<typeof authCallbackSchema>;
