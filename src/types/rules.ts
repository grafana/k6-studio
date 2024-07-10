import { Request, ProxyData } from '@/types'

export interface VariableValue {
  type: 'variable'
  variableName: string
}

export interface ArrayValue {
  type: 'array'
  arrayName: string
}

export interface CustomCodeValue {
  type: 'customCode'
  getValue: () => string | number | null | void
}

export interface RecordedValue {
  type: 'recordedValue'
}

export interface Filter {
  path: string
}

export interface BeginEndSelector {
  type: 'begin-end'
  from: 'headers' | 'body' | 'url'
  begin: string
  end: string
}

export interface RegexSelector {
  type: 'regex'
  from: 'headers' | 'body' | 'url'
  regex: string
}

export interface JsonSelector {
  type: 'json'
  path: string
}

export interface CustomCodeSelector {
  type: 'custom-code'
  snippet: string
}

export interface Selector {
  type: 'url'
  value: string
}

export type CorrelationSelector =
  | BeginEndSelector
  | RegexSelector
  | JsonSelector

export interface CorrelationExtractor {
  filter: Filter
  selector: CorrelationSelector
  variableName?: string
}

export interface CorrelationReplacer {
  filter: Filter
  selector: CorrelationSelector
}

export interface ParameterizationRule {
  type: 'parameterization'
  filter: Filter
  selector: Selector
  value: VariableValue | ArrayValue | CustomCodeValue
}

export interface CorrelationRule {
  type: 'correlation'
  name: string
  id: string
  extractor: CorrelationExtractor
  replacer?: CorrelationReplacer
}

export type BeginEndCorrelationRule = CorrelationRule & {
  extractor: { selector: BeginEndSelector }
}
export type RegexCorrelationRule = CorrelationRule & {
  extractor: { selector: RegexSelector }
}
export type JsonCorrelationRule = CorrelationRule & {
  extractor: { selector: JsonSelector }
}
export type CustomCodeCorrelationRule = CorrelationRule & {
  extractor: { selector: CustomCodeSelector }
}

export interface VerificationRule {
  type: 'verification'
  filter: Filter
  selector: Selector
  value: VariableValue | ArrayValue | CustomCodeValue | RecordedValue
}

export interface CustomCodeRule {
  type: 'customCode'
  filter: Filter
  placement: 'before' | 'after'
  snippet: string
}

export type TestRule =
  | ParameterizationRule
  | CorrelationRule
  | VerificationRule
  | CustomCodeRule

interface CorrelationState {
  extractedValue?: string
  count: number
  responsesExtracted: ProxyData[]
  requestsReplaced: [Request, Request][] // original, modified
  generatedUniqueId: number | undefined
}

export type CorrelationStateMap = Record<string, CorrelationState>
