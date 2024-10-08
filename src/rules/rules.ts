import { RequestSnippetSchema } from '@/types'
import { CorrelationStateMap, TestRule } from '@/types/rules'
import { exhaustive } from '../utils/typescript'
import { applyCustomCodeRule } from './customCode'
import { applyCorrelationRule } from './correlation'
import { applyVerificationRule } from './verification'
import { applyParameterizationRule } from './parameterization'

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
      return applyParameterizationRule(requestSnippetSchema, rule)
    case 'verification':
      return applyVerificationRule(requestSnippetSchema)
    default:
      return exhaustive(rule)
  }
}
