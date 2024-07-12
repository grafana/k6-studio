import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { TestRuleItem } from './TestRule'
import { NewRuleMenu } from '../NewRuleMenu'

export function TestRuleContainer() {
  const { rules, selectedRuleId } = useGeneratorStore()

  return (
    <Flex direction="column" gap="1" height="100%" p="2" pt="0">
      <ScrollArea scrollbars="vertical">
        <Flex
          position="sticky"
          align="center"
          justify="between"
          top="0"
          py="2"
          style={{ background: 'var(--color-background)' }}
        >
          Test rules ({rules.length})<NewRuleMenu />
        </Flex>

        {rules.map((rule, i) => (
          <TestRuleItem
            rule={rule}
            isSelected={rule.id === selectedRuleId}
            key={i}
          />
        ))}
      </ScrollArea>
    </Flex>
  )
}
