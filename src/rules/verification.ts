import { RequestSnippetSchema } from '@/types'
import { VerificationRule, VerificationRuleInstance } from '@/types/rules'
import { matchFilter } from './utils'
import { exhaustive } from '@/utils/typescript'

type CheckValue = string | number

function getValueFromRule(
  rule: VerificationRule,
  response: RequestSnippetSchema['data']['response']
): CheckValue {
  if (!response) return ''
  const { type } = rule.value

  switch (type) {
    case 'recordedValue':
      return rule.target === 'status' ? response.statusCode : response.content
    case 'string':
      return rule.value.value
    case 'variable':
      return `VARS['${rule.value.variableName}']`
    default:
      return exhaustive(type)
  }
}

const getExpectedValue = (
  rule: VerificationRule,
  value: CheckValue
): CheckValue => {
  switch (rule.target) {
    case 'status':
      return rule.value.type === 'variable' ? `Number(${value})` : value
    case 'body':
      return rule.value.type === 'variable' ? value : `'${value}'`
    default:
      return exhaustive(rule.target)
  }
}

function getCheckExpression(rule: VerificationRule, value: CheckValue): string {
  const target = rule.target === 'status' ? 'r.status' : 'r.body'
  const expectedValue = getExpectedValue(rule, value)

  switch (rule.operator) {
    case 'equals':
      return `${target} === ${expectedValue}`
    case 'contains':
      return `${target}.includes(${expectedValue})`
    case 'notContains':
      return `!${target}.includes(${expectedValue})`
    default:
      return exhaustive(rule.operator)
  }
}

function getCheckDescription(
  rule: VerificationRule,
  value: CheckValue
): string {
  const valueDescription =
    rule.value.type === 'variable'
      ? `variable "${rule.value.variableName}"`
      : value

  switch (rule.operator) {
    case 'equals':
      return `${rule.target} equals ${valueDescription}`
    case 'contains':
      return `${rule.target} contains ${valueDescription}`
    case 'notContains':
      return `${rule.target} does not contain ${valueDescription}`
    default:
      return exhaustive(rule.operator)
  }
}

export function createVerificationRuleInstance(
  rule: VerificationRule
): VerificationRuleInstance {
  return {
    rule,
    type: rule.type,
    apply: (requestSnippetSchema: RequestSnippetSchema) => {
      if (!matchFilter(requestSnippetSchema.data.request, rule.filter)) {
        return requestSnippetSchema
      }

      const {
        data: { response },
      } = requestSnippetSchema

      if (!response) {
        return requestSnippetSchema
      }

      const value = getValueFromRule(rule, response)
      const checkExpression = getCheckExpression(rule, value)
      const checkDescription = getCheckDescription(rule, value)

      // TODO: should not generate multiple check statements, instead should merge them
      const verificationSnippet = `check(resp, { '${checkDescription}': (r) => ${checkExpression}, })`

      return {
        ...requestSnippetSchema,
        after: [...requestSnippetSchema.after, verificationSnippet],
      }
    },
  }
}
