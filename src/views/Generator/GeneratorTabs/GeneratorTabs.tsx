import { css } from '@emotion/react'
import { Box, Flex, Tabs } from '@radix-ui/themes'
import { CircleXIcon } from 'lucide-react'
import { useState } from 'react'

import { ScriptPreview as ScriptPreviewType } from '@/hooks/useScriptPreview'
import {
  selectFilteredRequests,
  selectHasRecording,
  useGeneratorStore,
} from '@/store/generator'
import { ProxyData } from '@/types'

import { Allowlist } from '../Allowlist'
import { TestData } from '../TestData'
import { TestOptions } from '../TestOptions'

import { RequestList } from './RequestList'
import { ScriptPreview } from './ScriptPreview'

interface GeneratorTabsProps {
  script: ScriptPreviewType
  selectedRequest: ProxyData | null
  onSelectRequest: (request: ProxyData | null) => void
}

export function GeneratorTabs({
  script,
  selectedRequest,
  onSelectRequest,
}: GeneratorTabsProps) {
  const [tab, setTab] = useState('requests')
  const filteredRequests = useGeneratorStore(selectFilteredRequests)

  const hasRecording = useGeneratorStore(selectHasRecording)

  return (
    <Flex direction="column" height="100%" minHeight="0" asChild>
      <Tabs.Root value={tab} onValueChange={(value) => setTab(value)}>
        <Box flexShrink="0">
          <Tabs.List>
            <Flex justify="between" width="100%" align="center">
              <Flex>
                <Tabs.Trigger value="requests">
                  Requests ({filteredRequests.length})
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="script"
                  disabled={!hasRecording}
                  css={
                    !script.valid &&
                    css`
                      color: var(--red-9);
                    `
                  }
                >
                  {!script.valid && (
                    <CircleXIcon
                      css={css`
                        margin-right: var(--space-1);
                      `}
                      color="var(--red-9)"
                    />
                  )}
                  Script
                </Tabs.Trigger>
              </Flex>
              <Flex pr="2" pl="4" gap="4">
                <TestOptions />
                <TestData />
                <Allowlist />
              </Flex>
            </Flex>
          </Tabs.List>
        </Box>
        <Tabs.Content
          value="requests"
          css={css`
            flex-grow: 1;
            min-height: 0;
          `}
        >
          <RequestList
            requests={filteredRequests}
            onSelectRequest={onSelectRequest}
            selectedRequest={selectedRequest}
          />
        </Tabs.Content>
        <Tabs.Content
          value="script"
          css={css`
            flex-grow: 1;
            min-height: 0;
          `}
        >
          <ScriptPreview script={script} />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  )
}
