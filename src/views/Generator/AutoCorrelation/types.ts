import { InferUITools, StaticToolCall, UIDataTypes, UIMessage } from 'ai'

import { CorrelationRule, CorrelationState } from '@/types/rules'

import { tools } from './constants'

export type { ActionLogEntry } from '@/components/Assistant/types'

export type Tools = InferUITools<typeof tools>
export type Message = UIMessage<never, UIDataTypes, Tools>
export type ToolCall = StaticToolCall<typeof tools>

export type CorrelationStatus =
  | 'not-started'
  | 'correlation-not-needed'
  | 'validating'
  | 'analyzing'
  | 'creating-rules'
  | 'finalizing'
  | 'success'
  | 'partial-success'
  | 'failure'
  | 'error'
  | 'aborted'

export interface SuggestedRuleEntry {
  rule: CorrelationRule
  correlationState: CorrelationState
}
