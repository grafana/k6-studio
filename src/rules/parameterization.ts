import { RequestSnippetSchema, Request } from '@/types'
import {
  ParameterizationRule,
  ParameterizationRuleInstance,
  ParameterizationState,
} from '@/types/rules'
import { getFileNameWithoutExtension } from '@/utils/file'
import { exhaustive } from '@/utils/typescript'

import { replaceRequestValues } from './shared'
import { matchFilter } from './utils'

export function createParameterizationRuleInstance(
  rule: ParameterizationRule,
  idGenerator: Generator<number, number, number>
): ParameterizationRuleInstance {
  const state: ParameterizationState = {
    requestsReplaced: [],
    uniqueId: idGenerator.next().value,
    snippetInjected: false,

    matchedRequestIds: [],
  }

  function addReplacedRequests(original: Request, replaced: Request) {
    state.requestsReplaced = [
      ...state.requestsReplaced,
      {
        original,
        replaced,
      },
    ]
  }

  return {
    state,
    rule,
    type: rule.type,
    apply: (requestSnippet: RequestSnippetSchema) => {
      if (!matchFilter(requestSnippet.data.request, rule.filter)) {
        return requestSnippet
      }

      const updatedRequest = replaceRequestValues({
        selector: rule.selector,
        request: requestSnippet.data.request,
        value: getRuleValue(rule, state.uniqueId),
      })

      // Rule didn't match, return original request
      if (updatedRequest === undefined) {
        return requestSnippet
      }

      // Save original and replaced requests for preview
      addReplacedRequests(requestSnippet.data.request, updatedRequest)

      state.matchedRequestIds = [
        ...state.matchedRequestIds,
        requestSnippet.data.id,
      ]

      const updatedRequestSnippet: RequestSnippetSchema = {
        ...requestSnippet,
        data: {
          ...requestSnippet.data,
          request: updatedRequest ?? requestSnippet.data.request,
        },
      }

      if (!ruleNeedsSnippetInjection(rule) || state.snippetInjected) {
        return updatedRequestSnippet
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

    case 'dataFileValue': {
      const displayName = getFileNameWithoutExtension(value.fileName)
      return `\${getUniqueItem(FILES['${displayName}'])['${value.propertyName}']}`
    }

    case 'customCode':
      return `\${getParameterizationValue${id}()}`

    default:
      return exhaustive(value)
  }
}

export function getCustomCodeSnippet(code: string, id: number) {
  return `function getParameterizationValue${id}() {
${code}
}`
}

function ruleNeedsSnippetInjection(rule: ParameterizationRule) {
  return rule.value.type === 'customCode'
}
