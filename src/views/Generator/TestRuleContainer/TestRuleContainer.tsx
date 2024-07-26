import { useGeneratorStore } from '@/store/generator'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const selectedRuleId = useGeneratorStore((store) => store.selectedRuleId)
  const swapRules = useGeneratorStore((store) => store.swapRules)

  return (
    <ScrollArea scrollbars="vertical">
      <Flex direction="column" height="100%" gap="1" p="2" pt="0">
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

        <SortableRuleList
          rules={rules}
          selectedRuleId={selectedRuleId}
          onSwapRules={swapRules}
        />
      </Flex>
    </ScrollArea>
  )
}
