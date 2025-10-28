import { z } from 'zod'

import { HarEntry, HarPage } from '@/types/recording'

export const LogSchema = z.object({
  version: z.string(),
  creator: z.object({
    name: z.string(),
    version: z.string(),
  }),
  // Using transform with type casting as a temporary solution
  // before we introduce full HAR schemas.
  pages: z
    .array(z.unknown())
    .transform((value) => value as HarPage[])
    .optional(),
  entries: z
    .array(z.unknown())
    .transform((value) => value as HarEntry[])
    .optional(),
})
