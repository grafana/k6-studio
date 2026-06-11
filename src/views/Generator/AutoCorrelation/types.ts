import { InferUITools, StaticToolCall, UIDataTypes, UIMessage } from 'ai'

import { tools } from '@/handlers/ai/tools'
import { CorrelationRule, CorrelationState } from '@/types/rules'

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

export interface ActionLogEntry {
  id: string
  timestamp: number
  type:
    | 'reasoning'
    | 'found'
    | 'validation'
    | 'info'
    | 'outcome-success'
    | 'outcome-partial'
    | 'outcome-failure'
  text?: string
  ruleId?: string
  validationProgress?: {
    completed: number
    total: number
  }
}

export interface SuggestedRuleEntry {
  rule: CorrelationRule
  correlationState: CorrelationState
}
