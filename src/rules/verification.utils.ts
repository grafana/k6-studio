import { Response } from '@/types'
import { VerificationRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'

const NEWLINE_REGEX = /(?:\r\n|\r|\n)/g

export function getValueFromRule(rule: VerificationRule, response: Response) {
  const { type } = rule.value

  switch (type) {
    case 'recordedValue':
      return getRecordedValue(rule.target, response)
    case 'string':
      return `'${rule.value.value}'`
    case 'variable':
      return `VARS['${rule.value.variableName}']`
    case 'number':
      return rule.value.number
    default:
      return exhaustive(type)
  }
}

export function getCheckExpression(
  rule: VerificationRule,
  value: string | number
): string {
  const target = getTarget(rule)
  const { operator } = rule

  switch (operator) {
    case 'equals':
      return `${target} === ${value}`
    case 'contains':
      return `${target}.includes(${value})`
    case 'notContains':
      return `!${target}.includes(${value})`
    default:
      return exhaustive(operator)
  }
}

export function getCheckDescription(rule: VerificationRule): string {
  const valueDescription = getValueDescription(rule)
  const { operator } = rule

  switch (operator) {
    case 'equals':
      return `${rule.target} equals ${valueDescription}`
    case 'contains':
      return `${rule.target} contains ${valueDescription}`
    case 'notContains':
      return `${rule.target} does not contain ${valueDescription}`
    default:
      return exhaustive(operator)
  }
}

function getRecordedValue(
  target: VerificationRule['target'],
  response: Response
) {
  switch (target) {
    case 'status':
      return response.statusCode
    case 'body': {
      // Remove newlines when comparing the body to a recorded value
      const singleLineContent = response.content.replace(NEWLINE_REGEX, '')
      const escapedContent = escapeBackticksAndDollarSign(singleLineContent)

      return `String.raw\`${escapedContent}\``
    }
    default:
      return exhaustive(target)
  }
}

function getTarget(rule: VerificationRule) {
  const { target } = rule
  switch (target) {
    case 'status':
      return 'r.status'
    case 'body': {
      // Remove newlines when comparing the body to a recorded value
      if (rule.value.type === 'recordedValue' && rule.target === 'body') {
        return `r.body.replace(${NEWLINE_REGEX}, '')`
      }
      return 'r.body'
    }
    default:
      return exhaustive(target)
  }
}

function getValueDescription(rule: VerificationRule) {
  switch (rule.value.type) {
    case 'recordedValue':
      return 'recorded value'
    case 'string':
      return rule.value.value
    case 'variable':
      return `variable "${rule.value.variableName}"`
    case 'number':
      return rule.value.number
    default:
      return exhaustive(rule.value)
  }
}

// Without escaping, backticks and dollar sign break the String.raw template literal
function escapeBackticksAndDollarSign(str: string) {
  return str.replace(/\$/g, '${"$"}').replace(/`/g, '${"`"}')
}
