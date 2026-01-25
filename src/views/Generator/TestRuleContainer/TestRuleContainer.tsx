import { Button, Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { WandSparkles } from 'lucide-react'
import { useState } from 'react'

import { EmptyMessage } from '@/components/EmptyMessage'
import {
  selectFilteredRequests,
  selectSelectedRule,
  useGeneratorStore,
} from '@/store/generator'
import { StudioFile } from '@/types'

import { AutoCorrelationDialog } from '../AutoCorrelation/AutoCorrelationDialog'
import { NewRuleMenu } from '../NewRuleMenu'
import { RuleEditor } from '../RuleEditor'

import { RulesNotAppliedCallout } from './RulesNotAppliedCallout'
import { SortableRuleList } from './SortableRuleList'
import { StickyPanelHeader } from './StickyPanelHeader'

interface TestRuleContainerProps {
  file: StudioFile
}

export function TestRuleContainer({ file }: TestRuleContainerProps) {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)
  const selectedRule = useGeneratorStore(selectSelectedRule)
  const requests = useGeneratorStore(selectFilteredRequests)
  const [isAutoCorrelationDialogOpen, setIsAutoCorrelationDialogOpen] =
    useState(false)

  // Show help message if there are no rules or only automatically added verification rule
  const shouldShowHelpMessage =
    rules.length === 0 ||
    (rules.length === 1 && rules?.[0]?.type === 'verification')

  if (selectedRule) {
    return <RuleEditor rule={selectedRule} />
  }

  const isAutocorrelationButtonDisabled = requests.length === 0

  return (
    <>
      <ScrollArea scrollbars="vertical">
        <StickyPanelHeader>
          <RulesNotAppliedCallout />

          <Flex align="center" gap="3">
            <Heading size="2" weight="medium">
              Test rules ({rules.length})
            </Heading>
            <NewRuleMenu />
            <Button
              variant="ghost"
              size="1"
              color="gray"
              onClick={() => setIsAutoCorrelationDialogOpen(true)}
              disabled={isAutocorrelationButtonDisabled}
            >
              <WandSparkles />
              Autocorrelate
            </Button>
          </Flex>
        </StickyPanelHeader>
        <SortableRuleList rules={rules} onSwapRules={swapRules} />
        {shouldShowHelpMessage && (
          <>
            <EmptyMessage
              message="Configure your test logic by adding a new rule"
              pb="2"
              action={
                <Flex gap="2" align="center">
                  <Button
                    onClick={() => setIsAutoCorrelationDialogOpen(true)}
                    disabled={isAutocorrelationButtonDisabled}
                  >
                    <WandSparkles />
                    Autocorrelate
                  </Button>{' '}
                  <NewRuleMenu
                    variant="solid"
                    size="2"
                    color="orange"
                    text="Add rule manually"
                  />
                </Flex>
              }
            />
          </>
        )}
      </ScrollArea>

      <AutoCorrelationDialog
        file={file}
        open={isAutoCorrelationDialogOpen}
        onOpenChange={setIsAutoCorrelationDialogOpen}
      />
    </>
  )
}
