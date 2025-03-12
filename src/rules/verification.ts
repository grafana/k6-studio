import { RequestSnippetSchema } from '@/types'
import { VerificationRule, VerificationRuleInstance } from '@/types/rules'
import { matchFilter } from './utils'
import { exhaustive } from '@/utils/typescript'

type CheckValue = string | number

// TODO: this is redundant
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
  switch (rule.value.type) {
    case 'recordedValue':
      return rule.target === 'status'
        ? value
        : `String.raw\`${escapeBackticksAndDollarSign(value.replace(/(?:\r\n|\r|\n)/g, ''))}\``
    case 'string':
      return rule.target === 'status' ? value : `'${value}'`
    case 'variable':
      return rule.target === 'status' ? `Number(${value})` : value
    default:
      return exhaustive(rule.value)
  }
}

function getTarget(rule: VerificationRule) {
  const property = rule.target === 'status' ? 'r.status' : 'r.body'

  if (rule.value.type === 'recordedValue' && rule.target === 'body') {
    return `${property}.replace(/(?:\\r\\n|\\r|\\n)/g, '')`
  }

  return property
}

function getCheckExpression(rule: VerificationRule, value: CheckValue): string {
  const target = getTarget(rule)
  const expectedValue = getExpectedValue(rule, value)
  console.log('expectedValue', expectedValue)

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

function getValueDescription(rule: VerificationRule, value: CheckValue) {
  switch (rule.value.type) {
    case 'recordedValue':
      return rule.target === 'body' ? 'recorded value' : value
    case 'string':
      return value
    case 'variable':
      return `variable "${rule.value.variableName}"`
    default:
      return exhaustive(rule.value)
  }
}

function getCheckDescription(
  rule: VerificationRule,
  value: CheckValue
): string {
  const valueDescription = getValueDescription(rule, value)

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
  const state: VerificationRuleInstance['state'] = {
    matchedRequestIds: [],
  }

  return {
    rule,
    type: rule.type,
    state,
    apply: (requestSnippetSchema: RequestSnippetSchema) => {
      if (!matchFilter(requestSnippetSchema.data.request, rule.filter)) {
        return requestSnippetSchema
      }

      const {
        data: { response, id },
      } = requestSnippetSchema

      if (!response) {
        return requestSnippetSchema
      }

      // Update state with matched request
      state.matchedRequestIds = [...state.matchedRequestIds, id]

      const value = getValueFromRule(rule, response)
      const checkExpression = getCheckExpression(rule, value)
      const checkDescription = getCheckDescription(rule, value)

      const verificationSnippet = `check(resp, { '${checkDescription}': (r) => ${checkExpression}, })`

      return {
        ...requestSnippetSchema,
        after: [...requestSnippetSchema.after, verificationSnippet],
      }
    },
  }
}

// Without escaping, backticks and dollar sign break the String.raw template literal
function escapeBackticksAndDollarSign(str: string) {
  return str.replace(/\$/g, '${"$"}').replace(/`/g, '${"`"}')
}
