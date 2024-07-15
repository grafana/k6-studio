import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { Flex, Heading } from '@radix-ui/themes'
import { TestRuleItem } from './TestRule'
import { AllowList } from '../AllowList/AllowList'

export function TestRuleContainer() {
  const { rules } = useGeneratorStore()

  return (
    <Flex direction="column" gap="1" height="100%" p="2">
      <Flex justify="between" mb="2">
        <Heading size="3">Test rules ({rules.length}):</Heading>
        <AllowList />
      </Flex>
      {rules.map((rule, i) => (
        <TestRuleItem rule={rule} key={i} />
      ))}
    </Flex>
  )
}
