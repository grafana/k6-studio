import { describe, expect, it } from 'vitest'

import { ParameterizationRuleSchema } from '@/schemas/generator'
import { createProxyData, createRequest } from '@/test/factories/proxyData'

import {
  AiParameter,
  aiParameterToRule,
  getNonStringTargetError,
  mergeVariables,
} from './parameterization.utils'

const parameter: AiParameter = {
  field: 'email',
  location: { method: 'POST', path: '/api/login', in: 'body' },
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

describe('getNonStringTargetError', () => {
  const requests = [
    createProxyData({
      request: createRequest({
        method: 'POST',
        url: 'http://example.com/api/login',
        path: '/api/login',
        headers: [['content-type', 'application/json']],
        content:
          '{"email":"user@example.com","calories":2000,"newsletter":false}',
      }),
    }),
  ]

  function jsonParameter(path: string): AiParameter {
    return { ...parameter, selector: { type: 'json', from: 'body', path } }
  }

  it('rejects a json target that is a number in the recording', () => {
    expect(
      getNonStringTargetError(jsonParameter('calories'), requests)
    ).toContain('number')
  })

  it('rejects a json target that is a boolean in the recording', () => {
    expect(
      getNonStringTargetError(jsonParameter('newsletter'), requests)
    ).toContain('boolean')
  })

  it('accepts a json target that is a string in the recording', () => {
    expect(getNonStringTargetError(jsonParameter('email'), requests)).toBeNull()
  })

  it('normalizes JSONPath-style paths before checking', () => {
    expect(
      getNonStringTargetError(jsonParameter('$.calories'), requests)
    ).toContain('number')
  })

  it('ignores non-json selectors', () => {
    expect(
      getNonStringTargetError(
        { ...parameter, selector: { type: 'regex', from: 'url', regex: 'x' } },
        requests
      )
    ).toBeNull()
  })

  it('accepts when no recorded request matches the location', () => {
    expect(
      getNonStringTargetError(
        {
          ...jsonParameter('calories'),
          location: { method: 'POST', path: '/api/other', in: 'body' },
        },
        requests
      )
    ).toBeNull()
  })

  it('accepts when the path does not exist in matching bodies', () => {
    expect(
      getNonStringTargetError(jsonParameter('missing.path'), requests)
    ).toBeNull()
  })
})

describe('mergeVariables', () => {
  it('appends new variables and skips duplicates by name', () => {
    const { variables } = mergeVariables(
      [{ name: 'username', value: 'default' }],
      [
        { name: 'username', value: 'other' },
        { name: 'password', value: 'secret' },
        { name: 'password', value: 'secret-again' },
      ]
    )

    expect(variables).toEqual([
      { name: 'username', value: 'default' },
      { name: 'password', value: 'secret' },
    ])
  })

  it('reports only the names it actually added, excluding pre-existing collisions', () => {
    const { addedNames } = mergeVariables(
      [{ name: 'token', value: 'pre-existing' }],
      [
        { name: 'token', value: 'proposed' },
        { name: 'email', value: 'user@example.com' },
      ]
    )

    // `token` pre-existed, so cleanup must not treat it as this run's to delete.
    expect(addedNames).toEqual(['email'])
  })
})
