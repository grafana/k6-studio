import { BrowserEventTarget, CheckState } from '@/schemas/recording'

export interface CheckAssertionData {
  type: 'check'
  target: BrowserEventTarget
  inputType: 'aria' | 'native'
  expected: CheckState
}

export interface VisibilityAssertionData {
  type: 'visibility'
  target: BrowserEventTarget
  state: 'visible' | 'hidden'
}

export interface TextInputAssertionData {
  type: 'text-input'
  target: BrowserEventTarget
  multiline: boolean
  expected: string
}

export interface TextAssertionData {
  type: 'text'
  target: BrowserEventTarget
  text: string
}

export type AssertionData =
  | VisibilityAssertionData
  | CheckAssertionData
  | TextInputAssertionData
  | TextAssertionData
