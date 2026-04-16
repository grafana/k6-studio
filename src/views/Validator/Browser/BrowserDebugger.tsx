import { css } from '@emotion/react'
import { Flex, Tabs } from '@radix-ui/themes'
import { useState } from 'react'

import {
  LogsSection,
  useConsoleFilter,
} from '@/components/Validator/LogsSection'
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'
import { NodeSelector } from '@/schemas/selectors'

import { DebugSession } from '../types'

import { BrowserActionsPanel } from './BrowserActionsPanel'
import { BrowserOverviewPanel } from './BrowserOverviewPanel'
import { NetworkInspector } from './NetworkInspector'

interface BrowserDebuggerProps {
  script: string
  session: DebugSession
  onDebugScript: () => void
}

export function BrowserDebugger({
  script,
  session,
  onDebugScript,
}: BrowserDebuggerProps) {
  const [highlightedSelector, setHighlightedSelector] =
    useState<NodeSelector | null>(null)

  const [drawer, setDrawer] = usePanelCallbackRef()

  const consoleFilter = useConsoleFilter()

  const drawerLayout = useDefaultLayout({
    groupId: 'browser-debugger-drawer',
    storage: localStorage,
  })

  const mainLayout = useDefaultLayout({
    groupId: 'browser-debugger-main',
    storage: localStorage,
  })

  const handleTabClick = () => {
    if (drawer?.isCollapsed()) {
      drawer?.resize(300)
    }
  }

  return (
    <Tabs.Root asChild defaultValue="console">
      <Flex
        css={css`
          flex: 1 1 0;
        `}
        direction="column"
      >
        <Group
          {...drawerLayout}
          id="drawer"
          css={css`
            flex: 1 1 0;
          `}
          orientation="vertical"
        >
          <Panel id="main" minSize={400}>
            <Group
              {...mainLayout}
              id="main"
              css={css`
                height: 100%;
              `}
            >
              <Panel id="main" minSize={400}>
                <BrowserOverviewPanel
                  script={script}
                  session={session}
                  highlightedSelector={highlightedSelector}
                />
              </Panel>
              <Separator />
              <Panel id="actions" minSize={400}>
                <BrowserActionsPanel
                  session={session}
                  onDebugScript={onDebugScript}
                  onHighlight={setHighlightedSelector}
                />
              </Panel>
            </Group>
          </Panel>
          <Separator />
          <Tabs.List>
            <Tabs.Trigger value="console" onClick={handleTabClick}>
              Console ({session.logs.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="network" onClick={handleTabClick}>
              Network ({session.requests.length})
            </Tabs.Trigger>
          </Tabs.List>
          <Separator data-disabled />
          <Panel id="drawer" panelRef={setDrawer} collapsible minSize={100}>
            <Flex height="100%" direction="column" overflow="hidden">
              <Tabs.Content
                css={css`
                  overflow: hidden;
                  flex: 1 1 0;
                `}
                value="console"
              >
                <LogsSection
                  {...consoleFilter}
                  autoScroll={session.state === 'running'}
                  logs={session.logs}
                />
              </Tabs.Content>
              <Tabs.Content
                css={css`
                  overflow: hidden;
                  flex: 1 1 0;
                `}
                value="network"
              >
                <NetworkInspector session={session} />
              </Tabs.Content>
            </Flex>
          </Panel>
        </Group>
      </Flex>
    </Tabs.Root>
  )
}
