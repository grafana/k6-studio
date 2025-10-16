import { z } from 'zod'

import {
  HarContentSchema,
  HarEntrySchema,
  HarHeaderSchema,
  HarPageSchema,
  HarResponseSchema,
} from '@/schemas/recording/har'

export type HarEntry = z.infer<typeof HarEntrySchema>

export type HarPage = z.infer<typeof HarPageSchema>

export type HarContent = z.infer<typeof HarContentSchema>

export type HarHeader = z.infer<typeof HarHeaderSchema>

export type HarResponse = z.infer<typeof HarResponseSchema>
