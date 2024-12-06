import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { Flex, ScrollArea, Tabs, Text } from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'
import { css } from '@emotion/react'
import { TestOptions } from '../TestOptions'
import grotIllustration from '@/assets/grot.svg'
import { Allowlist } from '../Allowlist'
import { correlate } from '@/correlation/correlateArchiveData'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import type { Har } from 'har-format'
import { useMemo } from 'react'
import { SuggestionList } from '../Suggestions/SuggestionList'

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)

  const filteredRequests = useGeneratorStore(selectFilteredRequests)

  const correlations = useMemo(() => {
    if (!filteredRequests) {
      return []
    }

    return correlate(proxyDataToHar(filteredRequests) as Har)
  }, [filteredRequests])

  return (
    <Tabs.Root
      defaultValue="rules"
      css={css`
        height: 100%;
      `}
    >
      <Tabs.List>
        <Tabs.Trigger value="rules">Rules ({rules.length})</Tabs.Trigger>
        <Tabs.Trigger value="suggestions">
          Suggestions ({correlations.length})
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        value="rules"
        css={css`
          height: 100%;
        `}
      >
        <ScrollArea scrollbars="vertical">
          <Flex
            justify="end"
            position="sticky"
            align="center"
            top="0"
            p="2"
            gap="2"
            css={css`
              background-color: var(--color-background);
              z-index: 1;
            `}
          >
            <Flex gap="3">
              <NewRuleMenu />
              <TestOptions />
              <Allowlist />
            </Flex>
          </Flex>

          <SortableRuleList rules={rules} onSwapRules={swapRules} />
          <Flex
            py="3"
            px="6"
            align={rules.length === 0 ? 'center' : 'start'}
            direction="column"
            gap="3"
          >
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
      </Tabs.Content>

      <Tabs.Content
        value="suggestions"
        css={css`
          height: 100%;
        `}
      >
        <ScrollArea
          scrollbars="vertical"
          css={css`
            height: 100%;
          `}
        >
          <SuggestionList
            requests={filteredRequests}
            suggestions={correlations}
          />
        </ScrollArea>
      </Tabs.Content>
    </Tabs.Root>
  )
}
