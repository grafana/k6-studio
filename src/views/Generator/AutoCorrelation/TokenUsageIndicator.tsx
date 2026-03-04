import { Text } from '@radix-ui/themes'

import { TokenUsage } from '@/handlers/ai/types'

export function TokenUsageIndicator({
  tokenUsage,
}: {
  tokenUsage?: TokenUsage
}) {
  if (!tokenUsage) {
    return null
  }

  const input = formatNumberToCompact(tokenUsage.inputTokens || 0)
  const output = formatNumberToCompact(tokenUsage.outputTokens || 0)

  return (
    <Text size="1" color="gray">
      Tokens used: {input} input | {output} output
    </Text>
  )
}

// Show thousands as K
function formatNumberToCompact(num: number) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(num)
}
