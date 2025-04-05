import { z } from 'zod';

export const EnvSchema = z.object({
  AUTH_TYPE: z.enum(['basic', 'code']),
  AUTH_USERNAME: z.string(),
  AUTH_PASSWORD: z.string(),
  URL: z.string().url(),
});
