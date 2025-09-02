import { z } from 'zod'

export const LogEntrySchema = z.object({
  level: z.enum(['info', 'debug', 'warning', 'error']),
  msg: z.string(),
  source: z.string().optional(),
  time: z.string(),
  error: z.string().optional(),
})

export type LogEntry = z.infer<typeof LogEntrySchema>
