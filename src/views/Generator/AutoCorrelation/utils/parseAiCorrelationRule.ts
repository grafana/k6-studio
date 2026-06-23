import {
  AiCorrelationRule,
  AiCorrelationRuleSchema,
} from '@/types/autoCorrelation'

export type ParseAiCorrelationRuleResult =
  | { ok: true; rule: AiCorrelationRule }
  | { ok: false; error: string }

/**
 * Re-validates a model-supplied correlation rule against the Zod schema. The
 * AI SDK builds tools from JSON Schema with no validator (see buildToolSet), so
 * tool input reaches the renderer unchecked and without schema defaults. Parsing
 * here restores `extractionMode`'s `single` default and turns a malformed rule
 * into an error the model can correct, instead of an unhandled throw downstream.
 */
export function parseAiCorrelationRule(
  input: unknown
): ParseAiCorrelationRuleResult {
  const parsed = AiCorrelationRuleSchema.safeParse(input)

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'rule'}: ${issue.message}`)
      .join('; ')

    return { ok: false, error: `Invalid correlation rule: ${detail}` }
  }

  return { ok: true, rule: parsed.data }
}
