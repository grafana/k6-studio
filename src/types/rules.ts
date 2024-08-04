import { z } from 'zod'
import { Request, ProxyData } from '@/types'
import {
  ArrayValueSchema,
  BeginEndSelectorSchema,
  CorrelationExtractorSchema,
  CorrelationReplacerSchema,
  CorrelationRuleSchema,
  CustomCodeRuleSchema,
  CustomCodeSelectorSchema,
  CustomCodeValueSchema,
  FilterSchema,
  JsonSelectorSchema,
  ParameterizationRuleSchema,
  RecordedValueSchema,
  RegexSelectorSchema,
  RuleBaseSchema,
  SelectorSchema,
  TestRuleSchema,
  VariableValueSchema,
  VerificationRuleSchema,
} from '@/schemas/rules'

interface CorrelationState {
  extractedValue?: string
  count: number
  responsesExtracted: ProxyData[]
  requestsReplaced: [Request, Request][] // original, modified
  generatedUniqueId: number | undefined
}

export type CorrelationStateMap = Record<string, CorrelationState>

export type VariableValue = z.infer<typeof VariableValueSchema>
export type ArrayValue = z.infer<typeof ArrayValueSchema>
export type CustomCodeValue = z.infer<typeof CustomCodeValueSchema>
export type RecordedValue = z.infer<typeof RecordedValueSchema>
export type Filter = z.infer<typeof FilterSchema>
export type BeginEndSelector = z.infer<typeof BeginEndSelectorSchema>
export type RegexSelector = z.infer<typeof RegexSelectorSchema>
export type JsonSelector = z.infer<typeof JsonSelectorSchema>
export type CustomCodeSelector = z.infer<typeof CustomCodeSelectorSchema>
export type Selector = z.infer<typeof SelectorSchema>
export type CorrelationExtractor = z.infer<typeof CorrelationExtractorSchema>
export type CorrelationReplacer = z.infer<typeof CorrelationReplacerSchema>
export type RuleBase = z.infer<typeof RuleBaseSchema>
export type ParameterizationRule = z.infer<typeof ParameterizationRuleSchema>
export type CorrelationRule = z.infer<typeof CorrelationRuleSchema>
export type VerificationRule = z.infer<typeof VerificationRuleSchema>
export type CustomCodeRule = z.infer<typeof CustomCodeRuleSchema>
export type TestRule = z.infer<typeof TestRuleSchema>

export type CorrelationRuleBeginEnd = CorrelationRule & { extractor: { selector: BeginEndSelector } }
export type CorrelationRuleRegex = CorrelationRule & { extractor: { selector: RegexSelector } }
export type CorrelationRuleJson = CorrelationRule & { extractor: { selector: JsonSelector } }
export type CorrelationRuleCustomCode = CorrelationRule & { extractor: { selector: CustomCodeSelector } }
