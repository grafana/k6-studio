import { css } from '@emotion/react'
import { Box, Flex } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { ReactMonacoEditor } from '@/components/Monaco/ReactMonacoEditor'
import { PersistentTabs } from '@/components/primitives/PersistentTabs'
import { SessionPlayer } from '@/components/SessionPlayer/SessionPlayer'
import { ElementLocator } from '@/schemas/locator'

import { DebugSession } from '../types'

interface BrowserOverviewPanelProps {
  script: string
  session: DebugSession
  highlightedLocator: ElementLocator | null
  onScriptChange: (value: string) => void
}

export function BrowserOverviewPanel({
  script,
  session,
  highlightedLocator,
  onScriptChange,
}: BrowserOverviewPanelProps) {
  const [tab, setTab] = useState('script')

  useEffect(() => {
    return window.studio.script.onScriptStarted(() => {
      setTab('replay')
    })
  }, [])

  return (
    <PersistentTabs.Root asChild value={tab} onValueChange={setTab}>
      <Flex direction="column" height="100%">
        <Box asChild flexShrink="0">
          <PersistentTabs.List>
            <PersistentTabs.Trigger value="script">
              Script
            </PersistentTabs.Trigger>
            <PersistentTabs.Trigger
              value="replay"
              disabled={session.state === 'pending'}
            >
              Replay
            </PersistentTabs.Trigger>
          </PersistentTabs.List>
        </Box>
        <PersistentTabs.Content
          css={css`
            flex: 1 1 0;
            overflow: hidden;
          `}
          value="script"
          forceMount
        >
          <ReactMonacoEditor
            height="100%"
            value={script}
            language="typescript"
            onChange={(value) => value !== undefined && onScriptChange(value)}
          />
        </PersistentTabs.Content>
        <PersistentTabs.Content
          css={css`
            flex: 1 1 0;
            overflow: hidden;
          `}
          value="replay"
          forceMount
        >
          <SessionPlayer
            key={session.id}
            session={session}
            highlightedElement={highlightedLocator}
          />
        </PersistentTabs.Content>
      </Flex>
    </PersistentTabs.Root>
  )
}
