import { escapeRegExp } from 'lodash-es'

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
    case 'regex':
      return `new RegExp('${escapeRegExp(rule.value.regex)}')`
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
    case 'notEquals':
      return `${target} !== ${value}`
    case 'contains':
      return `${target}.includes(${value})`
    case 'notContains':
      return `!${target}.includes(${value})`
    case 'matches':
      return `${value}.test(${target})`
    default:
      return exhaustive(operator)
  }
}

export function getCheckDescription(
  rule: VerificationRule,
  value: string | number
): string {
  const valueDescription = getValueDescription(rule, value)
  const { operator } = rule

  switch (operator) {
    case 'equals':
      return `${rule.target} equals ${valueDescription}`
    case 'notEquals':
      return `${rule.target} does not equal ${valueDescription}`
    case 'contains':
      return `${rule.target} contains ${valueDescription}`
    case 'notContains':
      return `${rule.target} does not contain ${valueDescription}`
    case 'matches':
      return `${rule.target} matches ${valueDescription}`
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
      const singleLineContent = (response.content ?? '').replace(
        NEWLINE_REGEX,
        ''
      )
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

function getValueDescription(rule: VerificationRule, value: string | number) {
  switch (rule.value.type) {
    case 'recordedValue':
      return rule.target === 'status' ? value : 'recorded value'
    case 'string':
      return rule.value.value
    case 'variable':
      return `variable "${rule.value.variableName}"`
    case 'number':
      return rule.value.number
    case 'regex':
      return new RegExp(escapeRegExp(rule.value.regex)).toString()
    default:
      return exhaustive(rule.value)
  }
}

// Without escaping, backticks and dollar sign break the String.raw template literal
function escapeBackticksAndDollarSign(str: string) {
  return str.replace(/\$/g, '${"$"}').replace(/`/g, '${"`"}')
}
