import { css } from '@emotion/react'
import { Label } from '@radix-ui/react-label'
import { Flex, Heading, Switch, Tabs, Text } from '@radix-ui/themes'
import { useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
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
import { BrowserDebugDrawer } from './BrowserDebugDrawer'

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
    drawer?.expand()
  }

  return (
    <Flex
      css={css`
        flex: 1 1 0;
      `}
      direction="column"
    >
      <Group
        {...drawerLayout}
        css={css`
          flex: 1 1 0;
        `}
        orientation="vertical"
      >
        <Panel id="main">
          <Group
            {...mainLayout}
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
            <Panel id="actions" minSize="400px">
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
                {session.state === 'pending' && (
                  <DebuggerEmptyState onDebugScript={onDebugScript}>
                    Debug the script to inspect browser actions.
                  </DebuggerEmptyState>
                )}
                {session.state !== 'pending' && (
                  <AutoScrollArea
                    tail={session.state === 'running' && tailActions}
                    items={session.browserActions.length}
                    onScrollBack={handleActionsScrollBack}
                  >
                    <BrowserActionList actions={session.browserActions} />
                  </AutoScrollArea>
                )}
              </Flex>
            </Panel>
          </Group>
        </Panel>
        <Separator />
        <Panel
          panelRef={setDrawer}
          id="drawer"
          collapsible
          collapsedSize="40px"
          minSize="200px"
          defaultSize="0px"
        >
          <BrowserDebugDrawer
            css={css`
              height: 100%;
            `}
            session={session}
            onExpand={handleTabClick}
          />
        </Panel>
      </Group>
    </Flex>
  )
}
