import { Box, Checkbox, CheckboxGroup, Flex, Text } from '@radix-ui/themes'
import { useEffect } from 'react'

import { Label } from '@/components/Label'
import { CorrelationRule } from '@/types/rules'
import { fadeIn } from '@/utils/animations'

import { TestRuleInlineContent } from '../TestRuleContainer/TestRule/TestRuleInlineContent'
import { TestRuleTypeBadge } from '../TestRuleContainer/TestRule/TestRuleTypeBadge'

import { CorrelationStatus } from './types'

interface SuggestedRulesProps {
  suggestedRules: CorrelationRule[]
  isLoading: boolean
  checkedRuleIds: string[]
  setCheckedRuleIds: (ruleIds: string[]) => void
  correlationStatus: CorrelationStatus
}

export function SuggestedRules({
  suggestedRules,
  isLoading,
  checkedRuleIds,
  setCheckedRuleIds,
  correlationStatus,
}: SuggestedRulesProps) {
  useEffect(() => {
    // Suggested rules checked by default
    setCheckedRuleIds(suggestedRules.map((rule) => rule.id))
  }, [suggestedRules, setCheckedRuleIds])

  const allChecked =
    suggestedRules.length > 0 && checkedRuleIds.length === suggestedRules.length

  const handleToggleAll = () => {
    if (allChecked) {
      setCheckedRuleIds([])
    } else {
      setCheckedRuleIds(suggestedRules.map((rule) => rule.id))
    }
  }

  if (
    ['not-started', 'correlation-not-needed', 'error', 'failure'].includes(
      correlationStatus
    )
  ) {
    return null
  }

  if (suggestedRules.length === 0) {
    return (
      <Flex height="100%" align="center" justify="center">
        <Text color="gray">Your rules will appear here</Text>
      </Flex>
    )
  }

  return (
    <Box p="3">
      <Label mb="2">
        <Checkbox
          checked={allChecked}
          onCheckedChange={handleToggleAll}
          aria-label="Select all rules"
          disabled={isLoading}
        />
        <Text size="2">Select all</Text>
      </Label>

      <CheckboxGroup.Root
        onValueChange={setCheckedRuleIds}
        value={checkedRuleIds}
      >
        {suggestedRules.map((rule) => (
          <Label key={rule.id} mb="1" css={{ animation: fadeIn }}>
            <CheckboxGroup.Item disabled={isLoading} value={rule.id} />

            <Flex align="center" gap="2" flexGrow="1" minWidth="0">
              <TestRuleTypeBadge rule={rule} />
              <TestRuleInlineContent rule={rule} />
            </Flex>
          </Label>
        ))}
      </CheckboxGroup.Root>
    </Box>
  )
}
