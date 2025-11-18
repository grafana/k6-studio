import { css } from '@emotion/react'
import { Tabs } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { useTrackScriptCopy } from '@/hooks/useTrackScriptCopy'
import { Check, LogEntry } from '@/schemas/k6'

import { ReadOnlyEditor } from '../Monaco/ReadOnlyEditor'

import { ChecksSection } from './ChecksSection'
import { LogsSection } from './LogsSection'

interface ExecutionDetailsProps {
  isRunning: boolean
  script: string
  logs: LogEntry[]
  checks: Check[]
}

export function ExecutionDetails({
  isRunning,
  script,
  logs,
  checks,
}: ExecutionDetailsProps) {
  const [selectedTab, setSelectedTab] = useState<'logs' | 'checks' | 'script'>(
    'script'
  )

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

  const handleCopy = useTrackScriptCopy(script, 'debugger')

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
        <Tabs.Trigger value="script">Script</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content
        value="logs"
        css={css`
          flex: 1;
          min-height: 0;
        `}
      >
        <LogsSection logs={logs} autoScroll={isRunning} />
      </Tabs.Content>
      <Tabs.Content
        value="script"
        css={css`
          flex: 1;
        `}
      >
        <ReadOnlyEditor
          language="javascript"
          value={script}
          onCopy={handleCopy}
        />
      </Tabs.Content>
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
