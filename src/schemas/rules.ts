import { z } from 'zod'

export const VariableValueSchema = z.object({
  type: z.literal('variable'),
  variableName: z.string(),
})

export const ArrayValueSchema = z.object({
  type: z.literal('array'),
  arrayName: z.string(),
})

export const CustomCodeValueSchema = z.object({
  type: z.literal('customCode'),
  getValue: z
    .function()
    .returns(z.union([z.string(), z.number(), z.null(), z.void()])),
})

export const RecordedValueSchema = z.object({
  type: z.literal('recordedValue'),
})

export const FilterSchema = z.object({
  path: z.string(),
})

export const BeginEndSelectorSchema = z.object({
  type: z.literal('begin-end'),
  from: z.enum(['headers', 'body', 'url']),
  begin: z.string(),
  end: z.string(),
})

export const RegexSelectorSchema = z.object({
  type: z.literal('regex'),
  from: z.enum(['headers', 'body', 'url']),
  regex: z.string(),
})

export const JsonSelectorSchema = z.object({
  type: z.literal('json'),
  from: z.literal('body'),
  path: z.string(),
})

export const CustomCodeSelectorSchema = z.object({
  type: z.literal('custom-code'),
  snippet: z.string(),
})

export const StatusCodeSelectorSchema = z.object({
  type: z.literal('status-code'),
})

export const SelectorSchema = z.discriminatedUnion('type', [
  BeginEndSelectorSchema,
  RegexSelectorSchema,
  JsonSelectorSchema,
])

export const VerificationRuleSelectorSchema = z.discriminatedUnion('type', [
  BeginEndSelectorSchema,
  RegexSelectorSchema,
  JsonSelectorSchema,
  StatusCodeSelectorSchema,
])

export const CorrelationExtractorSchema = z.object({
  filter: FilterSchema,
  selector: SelectorSchema,
  variableName: z.string().optional(),
})

export const CorrelationReplacerSchema = z.object({
  filter: FilterSchema,
  selector: SelectorSchema,
})

export const RuleBaseSchema = z.object({
  id: z.string(),
})

export const ParameterizationRuleSchema = RuleBaseSchema.extend({
  type: z.literal('parameterization'),
  filter: FilterSchema,
  selector: SelectorSchema,
  value: z.discriminatedUnion('type', [
    VariableValueSchema,
    ArrayValueSchema,
    CustomCodeValueSchema,
  ]),
})

export const CorrelationRuleSchema = RuleBaseSchema.extend({
  type: z.literal('correlation'),
  extractor: CorrelationExtractorSchema,
  replacer: CorrelationReplacerSchema.optional(),
})

export const VerificationRuleSchema = RuleBaseSchema.extend({
  type: z.literal('verification'),
  filter: FilterSchema,
  selector: VerificationRuleSelectorSchema,
  value: z.discriminatedUnion('type', [
    VariableValueSchema,
    ArrayValueSchema,
    CustomCodeValueSchema,
    RecordedValueSchema,
  ]),
})

export const RecordingVerificationRuleSchema = RuleBaseSchema.extend({
  type: z.literal('recording-verification'),
})

export const CustomCodeRuleSchema = RuleBaseSchema.extend({
  type: z.literal('customCode'),
  filter: FilterSchema,
  placement: z.enum(['before', 'after']),
  snippet: z.string(),
})

export const TestRuleSchema = z.discriminatedUnion('type', [
  ParameterizationRuleSchema,
  CorrelationRuleSchema,
  VerificationRuleSchema,
  CustomCodeRuleSchema,
  RecordingVerificationRuleSchema,
])
