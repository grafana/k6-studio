import { TokenUsage } from '@/handlers/ai/types'

export function sumTokenUsage(
  prev: TokenUsage | undefined,
  next: TokenUsage
): TokenUsage {
  return {
    inputTokens: (prev?.inputTokens ?? 0) + (next.inputTokens ?? 0),
    outputTokens: (prev?.outputTokens ?? 0) + (next.outputTokens ?? 0),
    totalTokens: (prev?.totalTokens ?? 0) + (next.totalTokens ?? 0),
  }
}
