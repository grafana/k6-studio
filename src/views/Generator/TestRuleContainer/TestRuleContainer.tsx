import { useGeneratorStore } from '@/store/generator'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'
import { css } from '@emotion/react'
import { EmptyMessage } from '@/components/EmptyMessage'

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)

  // Show help message if there are no rules or only automatically added verification rule
  const shouldShowHelpMessage =
    rules.length === 0 ||
    (rules.length === 1 && rules?.[0]?.type === 'verification')

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
            font-size: 15px;
            line-height: 24px;
            font-weight: 500;
            padding: var(--space-2);
          `}
        >
          Test rules ({rules.length})
        </Heading>
        <Flex gap="3">
          <NewRuleMenu />
        </Flex>
      </Flex>

      <SortableRuleList rules={rules} onSwapRules={swapRules} />
      <Flex
        py="3"
        px="6"
        align={shouldShowHelpMessage ? 'center' : 'start'}
        direction="column"
        gap="3"
      >
        {shouldShowHelpMessage ? (
          <EmptyMessage
            message="Configure your test logic by adding a new rule"
            pb="2"
            action={<NewRuleMenu variant="solid" size="2" color="orange" />}
          />
        ) : (
          <NewRuleMenu />
        )}
      </Flex>
    </ScrollArea>
  )
}
