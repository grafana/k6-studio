import { describe, expect, it } from 'vitest'

import { parseAiCorrelationRule } from './parseAiCorrelationRule'

const validBeginEndRule = {
  extractor: {
    filter: { path: '' },
    variableName: 'token',
    selector: { type: 'begin-end', from: 'body', begin: 'a', end: 'b' },
  },
}

describe('parseAiCorrelationRule', () => {
  it('applies the extractionMode default when the model omits it', () => {
    const result = parseAiCorrelationRule(validBeginEndRule)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.rule.extractor.extractionMode).toBe('single')
    }
  })

  it('preserves an explicit extractionMode', () => {
    const result = parseAiCorrelationRule({
      extractor: { ...validBeginEndRule.extractor, extractionMode: 'multiple' },
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.rule.extractor.extractionMode).toBe('multiple')
    }
  })

  it('returns an error for a structurally invalid rule', () => {
    const result = parseAiCorrelationRule({
      extractor: { filter: { path: '' }, variableName: 'token' },
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid correlation rule')
    }
  })
})
