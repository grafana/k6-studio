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
  from: 'body'
  path: string
}

export interface CustomCodeSelector {
  type: 'custom-code'
  snippet: string
}

export type Selector = BeginEndSelector | RegexSelector | JsonSelector

export interface CorrelationExtractor {
  filter: Filter
  selector: Selector
  variableName?: string
}

export interface CorrelationReplacer {
  filter: Filter
  selector: Selector
}

interface RuleBase {
  id: string
}

export interface ParameterizationRule extends RuleBase {
  type: 'parameterization'
  filter: Filter
  selector: Selector
  value: VariableValue | ArrayValue | CustomCodeValue
}

export interface CorrelationRule extends RuleBase {
  type: 'correlation'
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

export interface VerificationRule extends RuleBase {
  type: 'verification'
  filter: Filter
  selector: Selector
  value: VariableValue | ArrayValue | CustomCodeValue | RecordedValue
}

export interface CustomCodeRule extends RuleBase {
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
