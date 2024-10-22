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
  rule: ParameterizationRule,
  idGenerator: Generator<number>
): ParameterizationRuleInstance {
  const state: ParameterizationState = {
    requestsReplaced: [],
    uniqueId: idGenerator.next().value,
  }

  return {
    state,
    rule,
    type: rule.type,
    apply: (requestSnippet: RequestSnippetSchema) => {
      if (!matchFilter(requestSnippet, rule)) {
        return requestSnippet
      }

      const updatedRequestSnippet = {
        ...requestSnippet,
        data: {
          ...requestSnippet.data,
          request: replaceRequestValues({
            selector: rule.selector,
            request: requestSnippet.data.request,
            value: getRuleValue(rule, state.uniqueId),
          }),
        },
        before: getBeforeSnippet(rule, requestSnippet.before, state.uniqueId),
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

function getRuleValue(rule: ParameterizationRule, id: number) {
  const { value } = rule

  switch (value.type) {
    case 'string':
      return value.value

    case 'variable':
      return `\${VARS['${value.variableName}']}`

    case 'customCode':
      return `\${getParameterizationValue${id}()}`

    case 'array':
      throw new Error('Not implemented')

    default:
      return exhaustive(value)
  }
}

function getBeforeSnippet(
  rule: ParameterizationRule,
  before: string[],
  id: number
) {
  if (rule.value.type !== 'customCode') {
    return before
  }

  return [...before, getCustomCodeSnippet(rule.value.code, id)]
}

function getCustomCodeSnippet(code: string, id: number) {
  return `function getParameterizationValue${id}() {
  ${code}
}`
}
