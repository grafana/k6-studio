/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { RequestSnippetSchema } from '@/types'
import { CorrelationStateMap, TestRule } from '@/types/rules'
import { exhaustive } from '../utils/typescript'
import { applyCustomCodeRule } from './customCode'
import { applyCorrelationRule } from './correlation'
import { applyVerificationRule } from './verification'

export function applyRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: TestRule,
  correlationStateMap: CorrelationStateMap,
  sequentialIdGenerator: Generator<number>
): RequestSnippetSchema {
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
      return requestSnippetSchema
    case 'verification':
      return applyVerificationRule(
        requestSnippetSchema,
        rule,
        correlationStateMap,
        sequentialIdGenerator
      )
    default:
      return exhaustive(rule)
  }
}
