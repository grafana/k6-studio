import { z } from 'zod'

export const VariableValueSchema = z.object({
  type: z.literal('variable'),
  variableName: z.string(),
})

export const DataFileValueSchema = z.object({
  type: z.literal('dataFileValue'),
  fileName: z.string(),
  propertyName: z.string(),
})

export const CustomCodeValueSchema = z.object({
  type: z.literal('customCode'),
  code: z.string(),
})

export const RecordedValueSchema = z.object({
  type: z.literal('recordedValue'),
})

export const StringValueSchema = z.object({
  type: z.literal('string'),
  value: z.coerce.string(),
})

export const NumberValueSchema = z.object({
  type: z.literal('number'),
  number: z
    .number({ message: 'Required' })
    .int()
    .nonnegative({ message: 'Must be a positive number' }),
})

export const RegexValueSchema = z.object({
  type: z.literal('regex'),
  regex: z.string().refine(
    (value) => {
      try {
        new RegExp(value)
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid regular expression' }
  ),
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

export const HeaderNameSelectorSchema = z.object({
  type: z.literal('header-name'),
  from: z.enum(['headers']),
  name: z.string(),
})

export const RegexSelectorSchema = z.object({
  type: z.literal('regex'),
  from: z.enum(['headers', 'body', 'url']),
  regex: z.string().refine(
    (value) => {
      try {
        new RegExp(value)
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid regular expression' }
  ),
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

export const TextSelectorSchema = z.object({
  type: z.literal('text'),
  from: z.enum(['headers', 'body', 'url']),
  value: z.string(),
})

export const ExtractorSelectorSchema = z.discriminatedUnion('type', [
  BeginEndSelectorSchema,
  RegexSelectorSchema,
  JsonSelectorSchema,
  HeaderNameSelectorSchema,
])

export const ReplacerSelectorSchema = z.discriminatedUnion('type', [
  BeginEndSelectorSchema,
  RegexSelectorSchema,
  JsonSelectorSchema,
  HeaderNameSelectorSchema,
  TextSelectorSchema,
])

export const CorrelationExtractorSchema = z.object({
  filter: FilterSchema,
  selector: ExtractorSelectorSchema,
  variableName: z.string().optional(),
  extractionMode: z.enum(['single', 'multiple']).default('single'),
})

export const CorrelationReplacerSchema = z.object({
  filter: FilterSchema,
  selector: ReplacerSelectorSchema.optional(),
})

export const RuleBaseSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
})

export const ParameterizationRuleSchema = RuleBaseSchema.extend({
  type: z.literal('parameterization'),
  filter: FilterSchema,
  selector: ReplacerSelectorSchema,
  value: z.discriminatedUnion('type', [
    VariableValueSchema,
    DataFileValueSchema,
    CustomCodeValueSchema,
    StringValueSchema,
  ]),
})

export const CorrelationRuleSchema = RuleBaseSchema.extend({
  type: z.literal('correlation'),
  extractor: CorrelationExtractorSchema,
  replacer: CorrelationReplacerSchema.optional(),
})

const VerificationOperator = z.enum([
  'equals',
  'notEquals',
  'contains',
  'notContains',
  // Regex only
  'matches',
])

const VerificationTarget = z.enum(['body', 'status'])

export const BaseVerificationRuleSchema = RuleBaseSchema.extend({
  type: z.literal('verification'),
  filter: FilterSchema,
})

export const StatusVerificationRuleSchema = BaseVerificationRuleSchema.extend({
  target: z.literal(VerificationTarget.enum.status),
  operator: z.enum([
    VerificationOperator.enum.equals,
    VerificationOperator.enum.notEquals,
    VerificationOperator.enum.matches,
  ]),
  value: z.discriminatedUnion('type', [
    RecordedValueSchema,
    NumberValueSchema,
    RegexValueSchema,
  ]),
})

export const BodyVerificationRuleSchema = BaseVerificationRuleSchema.extend({
  target: z.literal(VerificationTarget.enum.body),
  operator: VerificationOperator,
  value: z.discriminatedUnion('type', [
    StringValueSchema,
    RecordedValueSchema,
    RegexValueSchema,
    VariableValueSchema,
  ]),
})

export const VerificationRuleSchema = z.discriminatedUnion('target', [
  StatusVerificationRuleSchema,
  BodyVerificationRuleSchema,
])

export const CustomCodeRuleSchema = RuleBaseSchema.extend({
  type: z.literal('customCode'),
  filter: FilterSchema,
  placement: z.enum(['before', 'after']),
  snippet: z.string(),
})

export const TestRuleSchema = z.union([
  ParameterizationRuleSchema,
  CorrelationRuleSchema,
  VerificationRuleSchema,
  CustomCodeRuleSchema,
])
