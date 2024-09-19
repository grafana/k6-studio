import { useGeneratorStore } from '@/store/generator'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'
import { css } from '@emotion/react'
import { TestOptions } from '../TestOptions'

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)

  return (
    <ScrollArea scrollbars="vertical">
      <Flex
        position="sticky"
        align="center"
        top="0"
        pr="2"
        gap="4"
        css={css`
          background-color: var(--color-background);
          z-index: 1;
        `}
      >
        <Heading
          css={css`
            flex-grow: 1;
            font-size: 15px;
            line-height: 24px;
            font-weight: 500;
            padding: var(--space-2);
          `}
        >
          Test rules ({rules.length})
        </Heading>
        <TestOptions />
        <NewRuleMenu />
      </Flex>

      <SortableRuleList rules={rules} onSwapRules={swapRules} />
    </ScrollArea>
  )
}
