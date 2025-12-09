import { Text } from '@radix-ui/themes'

import { TokenUsage } from '@/handlers/ai/types'

export function TokenUsageIndicator({
  tokenUsage,
}: {
  tokenUsage?: TokenUsage
}) {
  if (tokenUsage?.totalTokens === undefined) {
    return null
  }

  const formatted = Intl.NumberFormat('en', { notation: 'compact' }).format(
    tokenUsage.totalTokens
  )

  return (
    <Text size="1" color="gray">
      Token usage: {formatted}
    </Text>
  )
}
