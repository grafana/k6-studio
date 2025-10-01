import { z } from 'zod'

export const LogEntrySchema = z.object({
  level: z.enum(['info', 'debug', 'warning', 'error']),
  msg: z.string(),
  source: z.string().optional(),
  time: z.string(),
  error: z.string().optional(),
})

export const CheckSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  passes: z.number(),
  fails: z.number(),
})

export const CheckArraySchema = z.array(CheckSchema)

export type LogEntry = z.infer<typeof LogEntrySchema>
export type Check = z.infer<typeof CheckSchema>
