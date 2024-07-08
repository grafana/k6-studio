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
  begin: string
  end: string
}

export interface RegexSelector {
  type: 'regex'
  regex: string
}

export interface JsonSelector {
  type: 'json'
  path: string
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
  from: 'headers' | 'body' | 'url'
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
