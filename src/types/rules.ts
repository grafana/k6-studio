import { Request, ProxyData } from '@/types'

interface CorrelationState {
  extractedValue?: string
  count: number
  responsesExtracted: ProxyData[]
  requestsReplaced: [Request, Request][] // original, modified
  generatedUniqueId: number | undefined
}

export type CorrelationStateMap = Record<string, CorrelationState>
