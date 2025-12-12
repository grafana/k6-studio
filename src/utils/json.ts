import { z } from 'zod'

export function safeJsonParse<T extends object>(value: string) {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    return undefined
  }
}

export function parseJsonAsSchema<
  Output = unknown,
  Def extends z.ZodTypeDef = z.ZodTypeDef,
  Input = Output,
>(
  value: string,
  schema: z.ZodType<Output, Def, Input>
): z.SafeParseReturnType<Input, Output> {
  try {
    return schema.safeParse(JSON.parse(value))
  } catch {
    return {
      success: false,
      error: new z.ZodError([]),
    }
  }
}
