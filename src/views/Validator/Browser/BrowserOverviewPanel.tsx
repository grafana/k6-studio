import { css } from '@emotion/react'
import { Box, Flex } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { SessionPlayer } from '@/components/SessionPlayer/SessionPlayer'
import { PersistentTabs } from '@/components/primitives/PersistentTabs'
import { ActionLocator } from '@/main/runner/schema'

import { DebugSession } from '../types'

interface BrowserOverviewPanelProps {
  script: string
  session: DebugSession
  highlightedSelector: ActionLocator | null
}

export function BrowserOverviewPanel({
  script,
  session,
  highlightedSelector,
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
          <ReadOnlyEditor
            value={script}
            showToolbar={false}
            language="typescript"
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
            highlightedSelector={highlightedSelector}
          />
        </PersistentTabs.Content>
      </Flex>
    </PersistentTabs.Root>
  )
}
