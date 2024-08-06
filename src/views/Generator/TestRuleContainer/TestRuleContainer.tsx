import { useGeneratorStore } from '@/store/generator'
import { Flex, ScrollArea, Text } from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'
import { css } from '@emotion/react'

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)

  return (
    <ScrollArea scrollbars="vertical">
      <Flex direction="column" height="100%" gap="1" p="2" pt="0">
        <Flex
          position="sticky"
          align="center"
          top="0"
          px="2"
          py="1"
          mx="-2"
          gap="1"
          css={css`
            background-color: var(--color-background);
            z-index: 1;
          `}
        >
          <Text size="2" weight="bold">
            Test rules ({rules.length})
          </Text>
          <NewRuleMenu />
        </Flex>

        <SortableRuleList rules={rules} onSwapRules={swapRules} />
      </Flex>
    </ScrollArea>
  )
}
