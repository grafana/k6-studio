import { css } from '@emotion/react'
import { useState } from 'react'

import { Box, Flex, Tabs } from '@radix-ui/themes'
import { ScriptPreview } from './ScriptPreview'
import {
  selectFilteredRequests,
  selectHasRecording,
  useGeneratorStore,
} from '@/store/generator'
import { RequestList } from './RequestList'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { CrossCircledIcon } from '@radix-ui/react-icons'
import { TestOptions } from '../TestOptions'
import { Allowlist } from '../Allowlist'
import { ProxyData } from '@/types'
import { TestData } from '../TestData'

export function GeneratorTabs({
  onSelectRequest,
  selectedRequest,
}: {
  onSelectRequest: (request: ProxyData | null) => void
  selectedRequest: ProxyData | null
}) {
  const [tab, setTab] = useState('requests')
  const filteredRequests = useGeneratorStore(selectFilteredRequests)
  const { hasError } = useScriptPreview()

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
                    hasError &&
                    css`
                      color: var(--red-9);
                    `
                  }
                >
                  {hasError && (
                    <CrossCircledIcon
                      css={css`
                        margin-right: 5px;
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
          `}
        >
          <ScriptPreview />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  )
}
