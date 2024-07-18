import { z } from 'zod'

export const VariableValue = z.object({
  type: z.literal('variable'),
  variableName: z.string(),
})

export const ArrayValue = z.object({
  type: z.literal('array'),
  arrayName: z.string(),
})

export const CustomCodeValue = z.object({
  type: z.literal('customCode'),
  getValue: z
    .function()
    .returns(z.union([z.string(), z.number(), z.null(), z.void()])),
})

export const RecordedValue = z.object({
  type: z.literal('recordedValue'),
})

export const Filter = z.object({
  path: z.string(),
})

export const BeginEndSelector = z.object({
  type: z.literal('begin-end'),
  from: z.enum(['headers', 'body', 'url']),
  begin: z.string(),
  end: z.string(),
})

export const RegexSelector = z.object({
  type: z.literal('regex'),
  from: z.enum(['headers', 'body', 'url']),
  regex: z.string(),
})

export const JsonSelector = z.object({
  type: z.literal('json'),
  from: z.literal('body'),
  path: z.string(),
})

export const CustomCodeSelector = z.object({
  type: z.literal('custom-code'),
  snippet: z.string(),
})

export const Selector = z.discriminatedUnion('type', [
  BeginEndSelector,
  RegexSelector,
  JsonSelector,
])

export const CorrelationExtractor = z.object({
  filter: Filter,
  selector: Selector,
  variableName: z.string().optional(),
})

export const CorrelationReplacer = z.object({
  filter: Filter,
  selector: Selector,
})

export const RuleBase = z.object({
  id: z.string(),
})

export const ParameterizationRule = RuleBase.extend({
  type: z.literal('parameterization'),
  filter: Filter,
  selector: Selector,
  value: z.discriminatedUnion('type', [
    VariableValue,
    ArrayValue,
    CustomCodeValue,
  ]),
})

export const CorrelationRule = RuleBase.extend({
  type: z.literal('correlation'),
  extractor: CorrelationExtractor,
  replacer: CorrelationReplacer.optional(),
})

export const VerificationRule = RuleBase.extend({
  type: z.literal('verification'),
  filter: Filter,
  selector: Selector,
  value: z.discriminatedUnion('type', [
    VariableValue,
    ArrayValue,
    CustomCodeValue,
    RecordedValue,
  ]),
})

export const CustomCodeRule = RuleBase.extend({
  type: z.literal('customCode'),
  filter: Filter,
  placement: z.enum(['before', 'after']),
  snippet: z.string(),
})

export const TestRule = z.discriminatedUnion('type', [
  ParameterizationRule,
  CorrelationRule,
  VerificationRule,
  CustomCodeRule,
])

export type VariableValue = z.infer<typeof VariableValue>
export type ArrayValue = z.infer<typeof ArrayValue>
export type CustomCodeValue = z.infer<typeof CustomCodeValue>
export type RecordedValue = z.infer<typeof RecordedValue>
export type Filter = z.infer<typeof Filter>
export type BeginEndSelector = z.infer<typeof BeginEndSelector>
export type RegexSelector = z.infer<typeof RegexSelector>
export type JsonSelector = z.infer<typeof JsonSelector>
export type CustomCodeSelector = z.infer<typeof CustomCodeSelector>
export type Selector = z.infer<typeof Selector>
export type CorrelationExtractor = z.infer<typeof CorrelationExtractor>
export type CorrelationReplacer = z.infer<typeof CorrelationReplacer>
export type RuleBase = z.infer<typeof RuleBase>
export type ParameterizationRule = z.infer<typeof ParameterizationRule>
export type CorrelationRule = z.infer<typeof CorrelationRule>
export type VerificationRule = z.infer<typeof VerificationRule>
export type CustomCodeRule = z.infer<typeof CustomCodeRule>
export type TestRule = z.infer<typeof TestRule>
