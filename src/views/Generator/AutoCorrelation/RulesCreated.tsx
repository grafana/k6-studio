import { Flex, ScrollArea, Text } from '@radix-ui/themes'

import { SuggestionListPanel } from '@/components/SuggestionList/SuggestionListPanel'

import { RuleCard } from './RuleCard'
import { SuggestedRuleEntry } from './types'

interface RulesCreatedProps {
  entries: SuggestedRuleEntry[]
  isLoading: boolean
  onRemoveRule: (ruleId: string) => void
}

export function RulesCreated({
  entries,
  isLoading,
  onRemoveRule,
}: RulesCreatedProps) {
  if (entries.length === 0) {
    return (
      <Flex height="100%" align="center" justify="center" p="6">
        <Text color="gray" size="2">
          Rules will appear here as they are created
        </Text>
      </Flex>
    )
  }

  return (
    <Flex direction="column" height="100%">
      <Flex
        px="3"
        py="2"
        justify="between"
        align="center"
        css={{ borderBottom: '1px solid var(--gray-4)' }}
      >
        <Text
          size="1"
          color="gray"
          weight="bold"
          css={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          Rules created
        </Text>
        <Text size="1" color="gray">
          {entries.length}
        </Text>
      </Flex>

      <ScrollArea css={{ flex: 1 }}>
        <Flex direction="column" p="3">
          <SuggestionListPanel>
            {entries.map((entry, index) => (
              <RuleCard
                key={entry.rule.id}
                entry={entry}
                action={{
                  type: 'remove',
                  onRemove: onRemoveRule,
                  disabled: isLoading,
                }}
                isLast={index === entries.length - 1}
              />
            ))}
          </SuggestionListPanel>
        </Flex>
      </ScrollArea>
    </Flex>
  )
}
