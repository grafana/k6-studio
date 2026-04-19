import { css } from '@emotion/react'
import { Tabs } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { useTrackScriptCopy } from '@/hooks/useTrackScriptCopy'
import { Check, LogEntry } from '@/schemas/k6'

import { ReadOnlyEditor } from '../Monaco/ReadOnlyEditor'

import { ChecksSection } from './ChecksSection'
import { LogsSection, useConsoleFilter } from './LogsSection'

interface ExecutionDetailsProps {
  isRunning: boolean
  script?: string
  logs: LogEntry[]
  checks: Check[]
}

export function ExecutionDetails({
  isRunning,
  script,
  logs,
  checks,
}: ExecutionDetailsProps) {
  const hasScript = script !== undefined && script !== ''

  const [selectedTab, setSelectedTab] = useState<'logs' | 'checks' | 'script'>(
    hasScript ? 'script' : 'logs'
  )

  const consoleFilter = useConsoleFilter({
    browser: false,
  })

  const handleTabChange = (value: string) => {
    if (value !== 'logs' && value !== 'checks' && value !== 'script') {
      return
    }

    setSelectedTab(value)
  }

  useEffect(() => {
    return window.studio.script.onScriptFailed(() => {
      setSelectedTab('logs')
    })
  }, [])

  useEffect(() => {
    if (!hasScript && selectedTab === 'script') {
      setSelectedTab('logs')
    }
  }, [hasScript, selectedTab])

  const handleCopy = useTrackScriptCopy(script ?? '', 'debugger')

  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={handleTabChange}
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <Tabs.List
        css={css`
          flex-shrink: 0;
        `}
      >
        <Tabs.Trigger value="logs">Logs ({logs.length})</Tabs.Trigger>
        <Tabs.Trigger value="checks" disabled={checks.length === 0}>
          Checks ({checks.length})
        </Tabs.Trigger>
        {hasScript && <Tabs.Trigger value="script">Script</Tabs.Trigger>}
      </Tabs.List>

      <Tabs.Content
        value="logs"
        css={css`
          flex: 1;
          min-height: 0;
        `}
      >
        <LogsSection {...consoleFilter} autoScroll={isRunning} logs={logs} />
      </Tabs.Content>
      {hasScript && (
        <Tabs.Content
          value="script"
          css={css`
            flex: 1;
          `}
        >
          <ReadOnlyEditor
            language="javascript"
            value={script ?? ''}
            onCopy={handleCopy}
          />
        </Tabs.Content>
      )}
      <Tabs.Content
        value="checks"
        css={css`
          flex: 1;
          min-height: 0;
        `}
      >
        <ChecksSection checks={checks} isRunning={isRunning} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
