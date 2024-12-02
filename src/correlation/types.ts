import { JsonValue } from './utils'

export type Path = Array<string | number>

export interface Variable {
  name: string
  selector: Selector
}

export interface ExtractedValue {
  name: string
  hash: string
  value: JsonValue
  selector: Selector
}

export interface PathSelector {
  type: 'path'
  index: number
  value: string
}

export interface SearchParamSelector {
  type: 'search'
  index: number
  name: string
}

export interface JsonSelector {
  type: 'json'
  path: Path
}

export interface HeaderSelector {
  type: 'header'
  index: number
  param: string
}

export interface CssSelector {
  type: 'css'
  rule: string
  attribute?: string
}

export interface ParamSelector {
  type: 'param'
  name: string
  value: string
}

export type BodySelector = JsonSelector | ParamSelector

export type Selector =
  | PathSelector
  | SearchParamSelector
  | CssSelector
  | ParamSelector
  | JsonSelector
  | HeaderSelector

export interface PathPatch {
  type: 'path'
  from: VariablePatch
  target: number
  selector: PathSelector
  value: string
}

export interface SearchParamPatch {
  type: 'search'
  from: VariablePatch
  target: number
  selector: SearchParamSelector
  value: string
}

export interface VariablePatch {
  type: 'variable'
  target: number
  variable: Variable
}

export interface BodyPatch {
  type: 'body'
  from: VariablePatch
  target: number
  selector: BodySelector
  value: JsonValue
}

export interface HeaderPatch {
  type: 'header'
  from: VariablePatch
  target: number
  selector: HeaderSelector
  value: string
}

export type Patch = PathPatch | SearchParamPatch | BodyPatch | HeaderPatch
