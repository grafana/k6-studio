import { css } from '@emotion/react'
import { Box, Flex, Tabs } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { NodeSelector } from '@/schemas/selectors'

import { DebugSession } from '../types'

import { SessionPlayer } from './SessionPlayer/SessionPlayer'

interface BrowserOverviewPanelProps {
  script: string
  session: DebugSession
  highlightedSelector: NodeSelector | null
  /** Default tab when there is no live script run (e.g. historical validator run). */
  initialTab?: 'script' | 'replay'
  /** Saved validator run replay: timeline at 00:00. */
  replayStartsAtBeginning?: boolean
}

export function BrowserOverviewPanel({
  script,
  session,
  highlightedSelector,
  initialTab = 'script',
  replayStartsAtBeginning = false,
}: BrowserOverviewPanelProps) {
  const [tab, setTab] = useState(initialTab)

  useEffect(() => {
    return window.studio.script.onScriptStarted(() => {
      setTab('replay')
    })
  }, [])

  const handleTabChange = (value: string) => {
    if (value !== 'script' && value !== 'replay') {
      return
    }

    setTab(value)
  }

  return (
    <Tabs.Root asChild value={tab} onValueChange={handleTabChange}>
      <Flex direction="column" height="100%">
        <Box asChild flexShrink="0">
          <Tabs.List>
            <Tabs.Trigger value="script">Script</Tabs.Trigger>
            <Tabs.Trigger value="replay" disabled={session.state === 'pending'}>
              Replay
            </Tabs.Trigger>
          </Tabs.List>
        </Box>
        <Tabs.Content
          css={css`
            display: none;
            flex: 1 1 0;
            overflow: hidden;

            &[data-state='active'] {
              display: flex;
            }
          `}
          value="script"
          forceMount
        >
          <ReadOnlyEditor
            value={script}
            showToolbar={false}
            language="typescript"
          />
        </Tabs.Content>
        <Tabs.Content
          css={css`
            display: none;
            flex: 1 1 0;

            overflow: hidden;

            &[data-state='active'] {
              display: flex;
            }
          `}
          value="replay"
          forceMount
        >
          <SessionPlayer
            key={session.id}
            session={session}
            highlightedSelector={highlightedSelector}
            startPausedAtBeginning={replayStartsAtBeginning}
          />
        </Tabs.Content>
      </Flex>
    </Tabs.Root>
  )
}
