import { TokenUsage } from '@/handlers/ai/types'

export function sumTokenUsage(
  current: TokenUsage | undefined,
  next: TokenUsage
): TokenUsage {
  return {
    inputTokens: (current?.inputTokens ?? 0) + (next.inputTokens ?? 0),
    outputTokens: (current?.outputTokens ?? 0) + (next.outputTokens ?? 0),
    totalTokens: (current?.totalTokens ?? 0) + (next.totalTokens ?? 0),
    cachedInputTokens:
      (current?.cachedInputTokens ?? 0) + (next.cachedInputTokens ?? 0),
    reasoningTokens:
      (current?.reasoningTokens ?? 0) + (next.reasoningTokens ?? 0),
  }
}
