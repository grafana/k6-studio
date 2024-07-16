/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { RequestSnippetSchema } from '@/types'
import { TestRule, CorrelationStateMap } from '@/types/rules'
import { exhaustive } from '../utils/typescript'
import { applyCustomCodeRule } from './customCode'
import { applyCorrelationRule } from './correlation'
import { matchFilter } from './utils'

export function applyRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: TestRule,
  correlationStateMap: CorrelationStateMap,
  sequentialIdGenerator: Generator<number>
): RequestSnippetSchema {
  if (!matchFilter(requestSnippetSchema, rule)) {
    return requestSnippetSchema
  }

  switch (rule.type) {
    case 'customCode':
      return applyCustomCodeRule(requestSnippetSchema, rule)
    case 'correlation':
      return applyCorrelationRule(
        requestSnippetSchema,
        rule,
        correlationStateMap,
        sequentialIdGenerator
      )
    case 'parameterization':
    case 'verification':
      return requestSnippetSchema
    default:
      return exhaustive(rule)
  }
}
