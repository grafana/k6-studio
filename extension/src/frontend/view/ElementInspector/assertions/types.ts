export interface CheckAssertionData {
  type: 'check'
  selector: string
  inputType: 'aria' | 'html'
  expected: 'checked' | 'unchecked' | 'indeterminate'
}

export interface VisibilityAssertionData {
  type: 'visibility'
  selector: string
  state: 'visible' | 'hidden'
}

export interface TextAssertionData {
  type: 'text'
  selector: string
  text: string
}

export type AssertionData =
  | VisibilityAssertionData
  | CheckAssertionData
  | TextAssertionData
