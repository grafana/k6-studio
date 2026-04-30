import { z } from 'zod'

export function safeJsonParse<T extends object>(value: string) {
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export function parseJsonAsSchema<Output = unknown, Input = Output>(
  value: string,
  schema: z.ZodType<Output, Input>
): z.ZodSafeParseResult<Output> {
  try {
    return schema.safeParse(JSON.parse(value))
  } catch {
    return schema.safeParse(undefined)
  }
}
