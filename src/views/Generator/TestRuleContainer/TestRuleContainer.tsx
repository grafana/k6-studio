import { Flex, Heading, ScrollArea } from '@radix-ui/themes'

import { EmptyMessage } from '@/components/EmptyMessage'
import { selectSelectedRule, useGeneratorStore } from '@/store/generator'

import { NewRuleMenu } from '../NewRuleMenu'
import { RuleEditor } from '../RuleEditor'

import { RulesNotAppliedCallout } from './RulesNotAppliedCallout'
import { SortableRuleList } from './SortableRuleList'
import { StickyPanelHeader } from './StickyPanelHeader'

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)
  const selectedRule = useGeneratorStore(selectSelectedRule)

  // Show help message if there are no rules or only automatically added verification rule
  const shouldShowHelpMessage =
    rules.length === 0 ||
    (rules.length === 1 && rules?.[0]?.type === 'verification')

  if (selectedRule) {
    return <RuleEditor rule={selectedRule} />
  }

  return (
    <ScrollArea scrollbars="vertical">
      <StickyPanelHeader>
        <RulesNotAppliedCallout />

        <Flex align="center" gap="3">
          <Heading size="2" weight="medium">
            Test rules ({rules.length})
          </Heading>
          <NewRuleMenu />
        </Flex>
      </StickyPanelHeader>
      <SortableRuleList rules={rules} onSwapRules={swapRules} />
      {shouldShowHelpMessage && (
        <EmptyMessage
          message="Configure your test logic by adding a new rule"
          pb="2"
          action={<NewRuleMenu variant="solid" size="2" color="orange" />}
        />
      )}
    </ScrollArea>
  )
}
