import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { Flex } from '@radix-ui/themes'
import { TestRuleItem } from './TestRule'

export function TestRuleContainer() {
  const { rules } = useGeneratorStore()

  return (
    <Flex direction="column" gap="1" height="100%" p="2">
      Test rules ({rules.length}):
      {rules.map((rule, i) => (
        <TestRuleItem rule={rule} key={i} />
      ))}
    </Flex>
  )
}
