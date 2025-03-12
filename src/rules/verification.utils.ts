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
      return getStringValue(rule.target, rule.value.value)
    case 'variable':
      return getVariableValue(rule.target, rule.value.variableName)
    default:
      return exhaustive(type)
  }
}

export function getCheckExpression(
  rule: VerificationRule,
  value: string | number
): string {
  const target = getTarget(rule)

  switch (rule.operator) {
    case 'equals':
      return `${target} === ${value}`
    case 'contains':
      return `${target}.includes(${value})`
    case 'notContains':
      return `!${target}.includes(${value})`
    default:
      return exhaustive(rule.operator)
  }
}

export function getCheckDescription(rule: VerificationRule): string {
  const valueDescription = getValueDescription(rule)

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

function getStringValue(target: VerificationRule['target'], value: string) {
  switch (target) {
    case 'status':
      return value
    case 'body':
      return `'${value}'`
    default:
      return exhaustive(target)
  }
}

function getVariableValue(
  target: VerificationRule['target'],
  variableName: string
) {
  switch (target) {
    case 'status':
      return `Number(VARS['${variableName}'])`
    case 'body':
      return `VARS['${variableName}']`
    default:
      return exhaustive(target)
  }
}

function getTarget(rule: VerificationRule) {
  switch (rule.target) {
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
      return exhaustive(rule.target)
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
    default:
      return exhaustive(rule.value)
  }
}

// Without escaping, backticks and dollar sign break the String.raw template literal
function escapeBackticksAndDollarSign(str: string) {
  return str.replace(/\$/g, '${"$"}').replace(/`/g, '${"`"}')
}
