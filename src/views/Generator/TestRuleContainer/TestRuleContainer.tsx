import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { Box } from '@radix-ui/themes'
import { TestRuleItem } from './TestRule'

export function TestRuleContainer() {
  const { rules } = useGeneratorStore()

  return (
    <Box height="100%" p="2">
      Rules:
      {rules.map((rule, i) => (
        <TestRuleItem rule={rule} key={i} />
      ))}
    </Box>
  )
}
