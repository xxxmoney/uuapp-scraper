import { z } from 'zod';

export const EnvSchema = z.object({
  IS_DEBUG: z.boolean().default(false),
  AUTH_USERNAME: z.string(),
  AUTH_PASSWORD: z.string(),
  URL: z.string().url(),
});
