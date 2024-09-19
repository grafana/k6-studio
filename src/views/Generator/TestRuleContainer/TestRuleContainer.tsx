import { useGeneratorStore } from '@/store/generator'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'
import { css } from '@emotion/react'

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)

  return (
    <ScrollArea scrollbars="vertical">
      <Flex
        position="sticky"
        justify="between"
        align="center"
        top="0"
        pr="2"
        gap="1"
        css={css`
          background-color: var(--color-background);
          z-index: 1;
        `}
      >
        <Heading
          css={css`
            font-size: 15px;
            line-height: 24px;
            font-weight: 500;
            padding: var(--space-2);
          `}
        >
          Test rules ({rules.length})
        </Heading>
        <NewRuleMenu />
      </Flex>

      <SortableRuleList rules={rules} onSwapRules={swapRules} />
    </ScrollArea>
  )
}
