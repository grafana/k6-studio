import { describe, expect, it } from 'vitest'

import {
  getConfigureTooltip,
  getValidateTooltip,
} from './GeneratorControls.utils'

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

describe('getConfigureTooltip', () => {
  it('prompts to select a recording when the generator has none', () => {
    expect(getConfigureTooltip(false, false, false)).toBe(
      'Select a recording to configure with the Assistant'
    )
    expect(getConfigureTooltip(false, false, true)).toBe(
      'Select a recording to configure with the Assistant'
    )
  })

  it('explains an empty recording gives the Assistant nothing to analyze', () => {
    expect(getConfigureTooltip(true, false, false)).toBe(
      'The selected recording has no requests to analyze'
    )
    expect(getConfigureTooltip(true, false, true)).toBe(
      'The selected recording has no requests to analyze'
    )
  })

  it('labels the collapsed icon button when compact', () => {
    expect(getConfigureTooltip(true, true, true)).toBe(
      'Configure with Assistant'
    )
  })

  it('shows no tooltip when the labelled button is enabled and roomy', () => {
    expect(getConfigureTooltip(true, true, false)).toBe('')
  })
})
