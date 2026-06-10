import { describe, expect, it } from 'vitest'

import { ParameterizationRuleSchema } from '@/schemas/generator'

import { AiParameter, aiParameterToRule } from './parameterization.utils'

const parameter: AiParameter = {
  field: 'email',
  location: { method: 'POST', path: '/api/login', in: 'body' },
  confidence: 'high',
  secret: false,
  recordedValue: 'user@example.com',
  selector: {
    type: 'json',
    from: 'body',
    path: 'email',
  },
  value: { type: 'string', value: 'user@example.com' },
}

describe('aiParameterToRule', () => {
  it('maps an AI proposal to a valid parameterization rule', () => {
    const { rule } = aiParameterToRule(parameter)

    expect(rule).toMatchObject({
      type: 'parameterization',
      enabled: true,
      filter: { path: '/api/login' },
      selector: parameter.selector,
      value: parameter.value,
    })
    expect(() => ParameterizationRuleSchema.parse(rule)).not.toThrow()
  })

  it('keeps the display metadata linked to the rule by id', () => {
    const { rule, meta } = aiParameterToRule(parameter)

    expect(meta).toEqual({
      ruleId: rule.id,
      field: 'email',
      location: parameter.location,
      confidence: 'high',
      secret: false,
      recordedValue: 'user@example.com',
    })
  })

  it('generates unique rule ids', () => {
    const first = aiParameterToRule(parameter)
    const second = aiParameterToRule(parameter)

    expect(first.rule.id).not.toBe(second.rule.id)
  })
})
