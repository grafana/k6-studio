import { RequestSnippetSchema } from '@/types'
import {
  ParameterizationRule,
  ParameterizationRuleInstance,
  ParameterizationState,
} from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { replaceRequestValues } from './shared'
import { matchFilter } from './utils'
import { isEqual } from 'lodash-es'

export function createParameterizationRuleInstance(
  rule: ParameterizationRule
): ParameterizationRuleInstance {
  const state: ParameterizationState = {
    requestsReplaced: [],
  }

  return {
    state,
    rule,
    type: rule.type,
    apply: (requestSnippet: RequestSnippetSchema) => {
      if (!matchFilter(requestSnippet, rule.filter)) {
        return requestSnippet
      }

      const updatedRequestSnippet = {
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

      // Save the original and updated request snippets for preview
      if (!isEqual(requestSnippet, updatedRequestSnippet)) {
        state.requestsReplaced = [
          ...state.requestsReplaced,
          {
            original: requestSnippet.data.request,
            replaced: updatedRequestSnippet.data.request,
          },
        ]
      }

      return updatedRequestSnippet
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
