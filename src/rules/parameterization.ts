import { RequestSnippetSchema, Request } from '@/types'
import {
  ParameterizationRule,
  ParameterizationRuleInstance,
  ParameterizationState,
} from '@/types/rules'
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
    snippedInjected: false,
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

      const updatedRequestSnippet: RequestSnippetSchema = {
        ...requestSnippet,
        data: {
          ...requestSnippet.data,
          request: updatedRequest ?? requestSnippet.data.request,
        },
      }

      if (!ruleNeedsSnippetInjection(rule) || state.snippedInjected) {
        return updatedRequestSnippet
      }

      const beforeSnippet = getBeforeSnippet(rule, state.uniqueId)

      if (beforeSnippet) {
        state.snippedInjected = true

        return {
          ...updatedRequestSnippet,
          before: [...updatedRequestSnippet.before, beforeSnippet],
        }
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

function getBeforeSnippet(rule: ParameterizationRule, id: number) {
  switch (rule.value.type) {
    case 'customCode':
      return getCustomCodeSnippet(rule.value.code, id)

    default:
      return
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
