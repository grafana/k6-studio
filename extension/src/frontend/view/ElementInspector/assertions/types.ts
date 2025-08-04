import { CheckState } from '@/schemas/recording'

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

export interface TextValueAssertionData {
  type: 'text-value'
  selector: string
  multiline: boolean
  expected: string
}

export interface TextAssertionData {
  type: 'text'
  selector: string
  text: string
}

export type AssertionData =
  | VisibilityAssertionData
  | CheckAssertionData
  | TextValueAssertionData
  | TextAssertionData
