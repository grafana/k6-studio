import { css } from '@emotion/react'
import { Box, Flex, Tabs } from '@radix-ui/themes'
import { CircleXIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

import { useScriptPreview } from '@/hooks/useScriptPreview'
import {
  selectFilteredRequests,
  selectHasGroups,
  selectHasRecording,
  selectLoadProfileExecutorOptions,
  useGeneratorStore,
} from '@/store/generator'
import { ProxyData } from '@/types'
import type { TestData as GeneratorTestData } from '@/types/testData'
import type {
  LoadProfileExecutorOptions,
  LoadZoneData,
  ThinkTime,
  Threshold,
} from '@/types/testOptions'

import { Allowlist } from '../Allowlist'
import { TestData } from '../TestData'
import { TestOptionsDialog } from '../TestOptions'

import { RequestList } from './RequestList'
import { ScriptPreview } from './ScriptPreview'

interface GeneratorTabsProps {
  selectedRequest: ProxyData | null
  onSelectRequest: (request: ProxyData | null) => void
}

export function GeneratorTabs({
  selectedRequest,
  onSelectRequest,
}: GeneratorTabsProps) {
  const [tab, setTab] = useState('requests')
  const filteredRequests = useGeneratorStore(selectFilteredRequests)
  const { hasError } = useScriptPreview()

  const hasRecording = useGeneratorStore(selectHasRecording)

  const loadProfile = useGeneratorStore(selectLoadProfileExecutorOptions)
  const sleepType = useGeneratorStore((store) => store.sleepType)
  const timing = useGeneratorStore((store) => store.timing)
  const hasGroups = useGeneratorStore(selectHasGroups)
  const thresholds = useGeneratorStore((store) => store.thresholds)
  const loadZones = useGeneratorStore((store) => store.loadZones)
  const variables = useGeneratorStore((store) => store.variables)
  const rules = useGeneratorStore((store) => store.rules)

  const handleLoadProfileChange = useCallback(
    (data: LoadProfileExecutorOptions) => {
      const {
        setExecutor,
        setStages,
        setVus,
        setIterations,
      } = useGeneratorStore.getState()
      setExecutor(data.executor)
      if (data.executor === 'ramping-vus') {
        setStages(data.stages)
      }
      if (data.executor === 'shared-iterations') {
        setVus(data.vus)
        setIterations(data.iterations)
      }
    },
    []
  )

  const handleThinkTimeChange = useCallback(
    (data: Pick<ThinkTime, 'sleepType' | 'timing'>) => {
      const { setSleepType, setTiming } = useGeneratorStore.getState()
      setSleepType(data.sleepType)
      setTiming(data.timing)
    },
    []
  )

  const handleThresholdsChange = useCallback((next: Threshold[]) => {
    useGeneratorStore.getState().setThresholds(next)
  }, [])

  const handleLoadZonesChange = useCallback((next: LoadZoneData) => {
    useGeneratorStore.getState().setLoadZones(next)
  }, [])

  const handleVariablesChange = useCallback(
    (next: GeneratorTestData['variables']) => {
      useGeneratorStore.getState().setVariables(next)
    },
    []
  )

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
                <TestOptionsDialog
                  loadProfile={loadProfile}
                  onLoadProfileChange={handleLoadProfileChange}
                  thinkTime={{ sleepType, timing }}
                  onThinkTimeChange={handleThinkTimeChange}
                  hasGroups={hasGroups}
                  thresholds={thresholds}
                  onThresholdsChange={handleThresholdsChange}
                  loadZones={loadZones}
                  onLoadZonesChange={handleLoadZonesChange}
                  variables={variables}
                  onVariablesChange={handleVariablesChange}
                  rules={rules}
                />
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
          <ScriptPreview />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  )
}
