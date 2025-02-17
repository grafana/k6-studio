import { selectSelectedRule, useGeneratorStore } from '@/store/generator'
import { Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'
import { css } from '@emotion/react'
import { EmptyMessage } from '@/components/EmptyMessage'
import { RuleEditor } from '../RuleEditor'
import { StickyPanelHeader } from './StickyPanelHeader'

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)
  const selectedRule = useGeneratorStore(selectSelectedRule)

  // Show help message if there are no rules or only automatically added verification rule
  const shouldShowHelpMessage =
    rules.length === 0 ||
    (rules.length === 1 && rules?.[0]?.type === 'verification')

  return (
    <ScrollArea scrollbars="vertical">
      {selectedRule && <RuleEditor rule={selectedRule} />}

      {!selectedRule && (
        <>
          <StickyPanelHeader>
            <Heading
              css={css`
                font-size: 15px;
                line-height: 24px;
                font-weight: 500;
              `}
            >
              Test rules ({rules.length})
            </Heading>
            <NewRuleMenu />
          </StickyPanelHeader>
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
        </>
      )}
    </ScrollArea>
  )
}
