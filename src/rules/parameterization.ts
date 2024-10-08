import { RequestSnippetSchema } from '@/types'
import { ParameterizationRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { replaceRequestValues } from './shared'
import { matchFilter } from './utils'

// TODO: might need to store changes somewhere to show in the UI as diff
export function applyParameterizationRule(
  requestSnippet: RequestSnippetSchema,
  rule: ParameterizationRule
): RequestSnippetSchema {
  if (!matchFilter(requestSnippet, rule)) {
    return requestSnippet
  }

  return {
    ...requestSnippet,
    data: {
      ...requestSnippet.data,
      request: replaceRequestValues({
        selector: rule.selector,
        request: requestSnippet.data.request,
        value: getRuleValue(rule),
      }),
    },
  }
}

function getRuleValue(rule: ParameterizationRule) {
  const { value } = rule

  switch (value.type) {
    case 'string':
      return value.value

    case 'variable':
      return `\${VARS['${value.variableName}']}`

    case 'array':
    case 'customCode':
      throw new Error('Not implemented')

    default:
      return exhaustive(value)
  }
}
