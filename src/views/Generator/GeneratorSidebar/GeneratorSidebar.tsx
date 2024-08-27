import { css } from '@emotion/react'
import { useEffect, useState } from 'react'

import { Checkbox, Flex, Tabs, Text } from '@radix-ui/themes'
import { ScriptPreview } from './ScriptPreview'
import {
  selectFilteredRequests,
  selectHasRecording,
  useGeneratorStore,
  selectStaticAssetCount,
} from '@/store/generator'
import { RulePreview } from '../RulePreview/RulePreview'
import { useGeneratorParams } from '../Generator.hooks'
import { Label } from '@/components/Label'
import { RequestList } from './RequestList'

export function GeneratorSidebar() {
  const [tab, setTab] = useState('requests')
  const filteredRequests = useGeneratorStore(selectFilteredRequests)

  const hasRecording = useGeneratorStore(selectHasRecording)
  const { ruleId } = useGeneratorParams()

  const includeStaticAssets = useGeneratorStore(
    (store) => store.includeStaticAssets
  )
  const setIncludeStaticAssets = useGeneratorStore(
    (store) => store.setIncludeStaticAssets
  )

  const staticAssetCount = useGeneratorStore(selectStaticAssetCount)

  useEffect(() => {
    if (ruleId === undefined) {
      setTab((currentTab) =>
        currentTab === 'rule-preview' ? 'requests' : currentTab
      )
      return
    }

    setTab('rule-preview')
  }, [ruleId])

  return (
    <Flex direction="column" height="100%" minHeight="0" asChild>
      <Tabs.Root value={tab} onValueChange={(value) => setTab(value)}>
        <Tabs.List>
          <Tabs.Trigger value="requests">
            Requests ({filteredRequests.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="script" disabled={!hasRecording}>
            Script preview
          </Tabs.Trigger>
          {ruleId !== undefined && (
            <Tabs.Trigger value="rule-preview">Rule preview</Tabs.Trigger>
          )}
        </Tabs.List>
        {ruleId !== undefined && (
          <Tabs.Content
            value="rule-preview"
            css={css`
              height: 100%;
            `}
          >
            <RulePreview />
          </Tabs.Content>
        )}
        <Tabs.Content
          value="requests"
          css={css`
            height: 100%;
          `}
        >
          <Label p="2">
            <Checkbox
              onCheckedChange={setIncludeStaticAssets}
              checked={includeStaticAssets}
            />
            <Text size="2">Include static assets ({staticAssetCount})</Text>
          </Label>
          <RequestList requests={filteredRequests} />
        </Tabs.Content>
        <Tabs.Content
          value="script"
          css={css`
            height: 100%;
          `}
        >
          <ScriptPreview />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  )
}
