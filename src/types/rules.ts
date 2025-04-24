import { z } from 'zod'

import {
  BeginEndSelectorSchema,
  CorrelationExtractorSchema,
  CorrelationReplacerSchema,
  CorrelationRuleSchema,
  CustomCodeRuleSchema,
  CustomCodeSelectorSchema,
  CustomCodeValueSchema,
  ExtractorSelectorSchema,
  FilterSchema,
  HeaderNameSelectorSchema,
  JsonSelectorSchema,
  ParameterizationRuleSchema,
  RecordedValueSchema,
  RegexSelectorSchema,
  ReplacerSelectorSchema,
  RuleBaseSchema,
  StatusCodeSelectorSchema,
  TestRuleSchema,
  TextSelectorSchema,
  VariableValueSchema,
  VerificationRuleSchema,
} from '@/schemas/generator'
import { Request, ProxyData, RequestSnippetSchema } from '@/types'

interface BaseRuleState {
  matchedRequestIds: string[]
}

export interface CorrelationState extends BaseRuleState {
  extractedValue?: string
  count: number
  responsesExtracted: ProxyData[]
  requestsReplaced: {
    original: Request
    replaced: Request
  }[]
  generatedUniqueId: number | undefined
}

interface BaseState {
  matchedRequestIds: string[]
}

export interface BaseRuleInstance<T extends TestRule, S = BaseState> {
  apply: (request: RequestSnippetSchema) => RequestSnippetSchema
  rule: T
  // Needed for discriminated union, nested rule.type doesn't work
  type: T['type']
  state: S
}

export type CorrelationRuleInstance = BaseRuleInstance<
  CorrelationRule,
  CorrelationState
>

export interface ParameterizationState extends BaseRuleState {
  requestsReplaced: {
    original: Request
    replaced: Request
  }[]
  uniqueId: number
  snippetInjected: boolean
}

export type ParameterizationRuleInstance = BaseRuleInstance<
  ParameterizationRule,
  ParameterizationState
>

export type VerificationRuleInstance = BaseRuleInstance<VerificationRule>
export type CustomCodeRuleInstance = BaseRuleInstance<CustomCodeRule>

export type RuleInstance =
  | CorrelationRuleInstance
  | ParameterizationRuleInstance
  | VerificationRuleInstance
  | CustomCodeRuleInstance

export type VariableValue = z.infer<typeof VariableValueSchema>
export type CustomCodeValue = z.infer<typeof CustomCodeValueSchema>
export type RecordedValue = z.infer<typeof RecordedValueSchema>
export type Filter = z.infer<typeof FilterSchema>
export type BeginEndSelector = z.infer<typeof BeginEndSelectorSchema>
export type RegexSelector = z.infer<typeof RegexSelectorSchema>
export type JsonSelector = z.infer<typeof JsonSelectorSchema>
export type StatusCodeSelector = z.infer<typeof StatusCodeSelectorSchema>
export type CustomCodeSelector = z.infer<typeof CustomCodeSelectorSchema>
export type HeaderNameSelector = z.infer<typeof HeaderNameSelectorSchema>
export type TextSelector = z.infer<typeof TextSelectorSchema>
export type ReplacerSelector = z.infer<typeof ReplacerSelectorSchema>
export type ExtractorSelector = z.infer<typeof ExtractorSelectorSchema>
export type Selector = ReplacerSelector | ExtractorSelector
export type CorrelationExtractor = z.infer<typeof CorrelationExtractorSchema>
export type CorrelationReplacer = z.infer<typeof CorrelationReplacerSchema>
export type RuleBase = z.infer<typeof RuleBaseSchema>
export type ParameterizationRule = z.infer<typeof ParameterizationRuleSchema>
export type CorrelationRule = z.infer<typeof CorrelationRuleSchema>
export type VerificationRule = z.infer<typeof VerificationRuleSchema>
export type CustomCodeRule = z.infer<typeof CustomCodeRuleSchema>
export type TestRule = z.infer<typeof TestRuleSchema>
