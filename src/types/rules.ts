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

export interface Selector {
  type: 'url'
  value: string
}

export interface ParameterizationRule {
  type: 'parameterization'
  filter: Filter
  selector: Selector
  value: VariableValue | ArrayValue | CustomCodeValue
}

export interface CorrelationRule {
  type: 'correlation'
  extractor: {
    filter: Filter
    selector: Selector
    variableName?: string
  }
  replacer?: {
    filter: Filter
    selector: Selector
  }
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
