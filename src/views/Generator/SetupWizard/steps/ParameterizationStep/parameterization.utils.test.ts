import { describe, expect, it } from 'vitest'

import { ParameterizationRuleSchema } from '@/schemas/generator'

import {
  AiParameter,
  aiParameterToRule,
  mergeVariables,
} from './parameterization.utils'

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
  variableName: 'email',
}

describe('aiParameterToRule', () => {
  it('maps an AI proposal to a variable-backed parameterization rule', () => {
    const { rule, variable } = aiParameterToRule(parameter)

    expect(rule).toMatchObject({
      type: 'parameterization',
      enabled: true,
      filter: { path: '/api/login' },
      selector: parameter.selector,
      value: { type: 'variable', variableName: 'email' },
    })
    expect(variable).toEqual({ name: 'email', value: 'user@example.com' })
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

  it.each([
    ['$.user.email', 'user.email'],
    ['$.items[0].id', 'items[0].id'],
    ["$['user']['email']", "['user']['email']"],
    ['user.email', 'user.email'],
  ])(
    'normalizes the JSONPath-style selector path %s to %s',
    (path, expected) => {
      const { rule } = aiParameterToRule({
        ...parameter,
        selector: { type: 'json', from: 'body', path },
      })

      expect(rule.selector).toEqual({
        type: 'json',
        from: 'body',
        path: expected,
      })
    }
  )

  it('leaves non-json selector paths untouched', () => {
    const { rule } = aiParameterToRule({
      ...parameter,
      selector: { type: 'regex', from: 'url', regex: '\\$\\.(\\d+)' },
    })

    expect(rule.selector).toEqual({
      type: 'regex',
      from: 'url',
      regex: '\\$\\.(\\d+)',
    })
  })

  it('generates unique rule ids', () => {
    const first = aiParameterToRule(parameter)
    const second = aiParameterToRule(parameter)

    expect(first.rule.id).not.toBe(second.rule.id)
  })
})

describe('mergeVariables', () => {
  it('appends new variables and skips duplicates by name', () => {
    const merged = mergeVariables(
      [{ name: 'username', value: 'default' }],
      [
        { name: 'username', value: 'other' },
        { name: 'password', value: 'secret' },
        { name: 'password', value: 'secret-again' },
      ]
    )

    expect(merged).toEqual([
      { name: 'username', value: 'default' },
      { name: 'password', value: 'secret' },
    ])
  })
})
