import { useGeneratorStore } from '@/store/generator'
import { Flex, Heading, ScrollArea, Text } from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'
import { css } from '@emotion/react'
import { TestOptions } from '../TestOptions'
import grotIllustration from '@/assets/grot.svg'

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
        gap="2"
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
        <NewRuleMenu />
        <TestOptions />
      </Flex>

      <SortableRuleList rules={rules} onSwapRules={swapRules} />
      <Flex py="3" px="6" align="center" direction="column" gap="3">
        {rules.length === 0 ? (
          <>
            <img
              src={grotIllustration}
              css={css`
                max-height: 200px;
              `}
            />
            <Text size="1" color="gray">
              Start configuring your test logic by adding a new rule
            </Text>
            <NewRuleMenu variant="solid" size="2" />
          </>
        ) : (
          <NewRuleMenu />
        )}
      </Flex>
    </ScrollArea>
  )
}
