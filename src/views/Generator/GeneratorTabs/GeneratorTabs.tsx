import { css } from '@emotion/react'
import { Box, Flex, Tabs } from '@radix-ui/themes'
import { CircleXIcon } from 'lucide-react'
import { useState } from 'react'

import { useScriptPreview } from '@/hooks/useScriptPreview'
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
  fileName: string
  selectedRequest: ProxyData | null
  onSelectRequest: (request: ProxyData | null) => void
}

export function GeneratorTabs({
  fileName,
  selectedRequest,
  onSelectRequest,
}: GeneratorTabsProps) {
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
          <ScriptPreview fileName={fileName} />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  )
}
