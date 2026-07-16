import { describe, expect, it } from 'vitest'

import { getValidateTooltip } from './GeneratorControls.utils'

describe('getValidateTooltip', () => {
  it('prompts to fix script errors when the script is not exportable', () => {
    expect(getValidateTooltip(false, true, false)).toBe(
      'Fix script errors to enable validation'
    )
  })

  it('prompts to start the proxy when it is offline', () => {
    expect(getValidateTooltip(true, false, false)).toBe(
      'Start proxy to enable validation'
    )
  })

  it('labels the collapsed icon button when compact', () => {
    expect(getValidateTooltip(true, true, true)).toBe('Validate')
  })

  it('shows no tooltip when the labelled button is enabled and roomy', () => {
    expect(getValidateTooltip(true, true, false)).toBe('')
  })
})
