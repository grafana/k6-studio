import { css } from '@emotion/react'
import { Label } from '@radix-ui/react-label'
import { Flex, Heading, Switch, Tabs, Text } from '@radix-ui/themes'
import { useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { LogsSection } from '@/components/Validator/LogsSection'
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'

import { DebuggerEmptyState } from '../DebuggerEmptyState'
import { DebugSession } from '../types'

import { BrowserActionList } from './BrowserActionList'
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
  const [tailActions, setTailActions] = useState(true)
  const [drawer, setDrawer] = usePanelCallbackRef()

  const drawerLayout = useDefaultLayout({
    groupId: 'browser-debugger-drawer',
    storage: localStorage,
  })

  const mainLayout = useDefaultLayout({
    groupId: 'browser-debugger-main',
    storage: localStorage,
  })

  const handleActionsScrollBack = () => {
    setTailActions(false)
  }

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
          <Panel id="main">
            <Group
              {...mainLayout}
              id="main"
              css={css`
                height: 100%;
              `}
            >
              <Panel id="main">
                <Tabs.Root asChild defaultValue="script">
                  <Flex direction="column" height="100%">
                    <Tabs.List>
                      <Tabs.Trigger
                        disabled
                        css={css`
                          /* 
                        * Since we currently only have a single tab, we disable the
                        * hover styling. This should be removed once we have more tabs.
                        */
                          cursor: default;

                          &:hover .rt-TabsTriggerInner {
                            background-color: transparent;
                          }
                        `}
                        value="script"
                      >
                        Script
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content
                      css={css`
                        flex: 1 1 0;
                        overflow: hidden;
                      `}
                      value="script"
                    >
                      <ReadOnlyEditor
                        value={script}
                        showToolbar={false}
                        language="typescript"
                      />
                    </Tabs.Content>
                  </Flex>
                </Tabs.Root>
              </Panel>
              <Separator />
              <Panel id="actions" minSize={400}>
                <Flex direction="column" height="100%">
                  <Flex
                    justify="between"
                    pr="2"
                    css={css`
                      border-bottom: 1px solid var(--gray-a5);
                    `}
                  >
                    <Flex align="center" gap="1">
                      <Heading
                        size="2"
                        weight="medium"
                        css={css`
                          min-height: 40px;
                          padding: 0 var(--space-2);
                          display: flex;
                          align-items: center;
                        `}
                      >
                        Browser actions ({session.browserActions.length})
                      </Heading>
                    </Flex>

                    {session.state === 'running' && (
                      <Flex asChild gap="2" align="center">
                        <Label>
                          <Text size="2">Tail log</Text>
                          <Switch
                            checked={tailActions}
                            onCheckedChange={setTailActions}
                          />
                        </Label>
                      </Flex>
                    )}
                  </Flex>
                  <AutoScrollArea
                    tail={session.state === 'running' && tailActions}
                    items={session.browserActions.length}
                    onScrollBack={handleActionsScrollBack}
                  >
                    {session.state === 'pending' && (
                      <DebuggerEmptyState onDebugScript={onDebugScript}>
                        Debug the script to inspect browser actions.
                      </DebuggerEmptyState>
                    )}
                    {session.state !== 'pending' && (
                      <BrowserActionList actions={session.browserActions} />
                    )}
                  </AutoScrollArea>
                </Flex>
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
                <LogsSection autoScroll={false} logs={session.logs} />
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
