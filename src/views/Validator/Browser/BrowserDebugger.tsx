import { css } from '@emotion/react'
import {
  Box,
  Flex,
  Heading,
  Switch,
  TabNav,
  Tabs,
  Text,
} from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'
import { Label } from '@/components/Label'
import { ChecksSection } from '@/components/Validator/ChecksSection'
import { LogsSection } from '@/components/Validator/LogsSection'

import { DebugSession } from '../types'

import { BrowserActionList } from './BrowserActionList'
import { NetworkInspector } from './NetworkInspector'

function TabContent({
  children,
  ...props
}: Omit<Tabs.ContentProps, 'asChild'>) {
  return (
    <Tabs.Content asChild {...props}>
      <Flex
        css={css`
          flex: 1 1 0;
        `}
        align="stretch"
        direction="column"
      >
        {children}
      </Flex>
    </Tabs.Content>
  )
}

interface BrowserDebuggerProps {
  session: DebugSession
}

export function BrowserDebugger({ session }: BrowserDebuggerProps) {
  const [tailActions, setTailActions] = useState(true)

  const handleActionsScrollBack = () => {
    setTailActions(false)
  }

  return (
    <Flex
      css={css`
        flex: 1 1 0;
        background-color: var(--gray-2);

        @scope (.split-view) to (.split-view-view) {
          &:before {
            height: 0;
          }
        }
      `}
      overflow="hidden"
      direction="column"
    >
      <Tabs.Root asChild defaultValue="network">
        <Allotment
          vertical
          css={css`
            background-color: var(--color-background);
            border: 1px solid #1f180021;
            border-top: none;
            border-bottom: none;
          `}
        >
          <Allotment.Pane minSize={400}>
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
                    css={css`
                      font-size: 15px;
                      line-height: 24px;
                      font-weight: 500;
                      padding: var(--space-2);
                      display: flex;
                      align-items: center;
                    `}
                  >
                    Browser actions ({session.browserActions.length})
                  </Heading>
                </Flex>

                <Flex gap="2" align="center">
                  {session.state === 'running' && (
                    <Label>
                      <Text size="2">Tail log</Text>
                      <Switch
                        checked={tailActions}
                        onCheckedChange={setTailActions}
                      />
                    </Label>
                  )}
                </Flex>
              </Flex>
              <AutoScrollArea
                tail={session.state === 'running' && tailActions}
                items={session.browserActions.length}
                onScrollBack={handleActionsScrollBack}
              >
                <BrowserActionList actions={session.browserActions} />
              </AutoScrollArea>
            </Flex>
          </Allotment.Pane>
          <Allotment.Pane minSize={40} maxSize={40}>
            <TabNav.Root>
              <Tabs.List>
                <Tabs.Trigger value="network">
                  Network ({session.requests.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="checks">
                  Checks ({session.checks.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="console">
                  Console ({session.logs.length})
                </Tabs.Trigger>
              </Tabs.List>
            </TabNav.Root>
          </Allotment.Pane>
          <Allotment.Pane snap minSize={150} preferredSize={300}>
            <Box height="100%" width="100%">
              <Flex
                direction="column"
                align="stretch"
                height="100%"
                overflow="hidden"
              >
                <TabContent value="console">
                  <LogsSection autoScroll={false} logs={session.logs} />
                </TabContent>
                <Tabs.Content asChild value="network">
                  <div
                    css={css`
                      overflow: hidden;
                      flex: 1 1 0;
                    `}
                  >
                    <NetworkInspector
                      script=""
                      session={session}
                      isRunning={false}
                    />
                  </div>
                </Tabs.Content>
                <TabContent value="checks">
                  <ChecksSection isRunning={false} checks={session.checks} />
                </TabContent>
              </Flex>
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Tabs.Root>
    </Flex>
  )
}
