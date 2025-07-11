import { CheckState } from '@/schemas/recording'
import { NonEmptyArray } from '@/utils/list'

export interface CheckAssertionData {
  type: 'check'
  selector: string
  inputType: 'aria' | 'html'
  expected: CheckState
}

export interface VisibilityAssertionData {
  type: 'visibility'
  selector: string
  state: 'visible' | 'hidden'
}

export interface InputValueAssertionData {
  type: 'input-value'
  selector: string
  multiline: boolean
  expected: string
}

export interface AssertedSelectOption {
  value: string
  label: string
}

export interface SelectValueAssertionData {
  type: 'select-value'
  selector: string
  expected: NonEmptyArray<AssertedSelectOption>
  options: AssertedSelectOption[]
}

export interface TextAssertionData {
  type: 'text'
  selector: string
  text: string
}

export type AssertionData =
  | VisibilityAssertionData
  | CheckAssertionData
  | InputValueAssertionData
  | TextAssertionData
  | SelectValueAssertionData
