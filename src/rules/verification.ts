import { ProxyData, RequestSnippetSchema, Response, Request } from '@/types'
import {
  CorrelationStateMap,
  CorrelationRule,
  BeginEndSelector,
  RegexSelector,
  JsonSelector,
} from '@/types/rules'
import { cloneDeep, isEqual } from 'lodash-es'
import {
  canonicalHeaderKey,
  matchFilter,
  generateSequentialInt,
  isJsonReqResp,
} from './utils'
import { exhaustive } from '@/utils/typescript'
import { replaceCorrelatedValues } from './correlation.utils'
import { matchBeginEnd, matchRegex, getJsonObjectFromPath } from './shared'

export function applyVerificationRule(
  requestSnippetSchema: RequestSnippetSchema,
  rule: VerificationRule,
  correlationStateMap: CorrelationStateMap,
  sequentialIdGenerator: Generator<number>
): RequestSnippetSchema {
  // Skip verification if filter doesn't match
  if (!matchFilter(requestSnippetSchema, rule)) {
    return requestSnippetSchema
  }

  // add snippet for extraction

  return {
    ...requestSnippetSchema,
    after: [...requestSnippetSchema['after'], "HELLO"],
  }
}
