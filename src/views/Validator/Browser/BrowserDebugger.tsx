import { css } from '@emotion/react'
import { Box, Flex, Heading, Switch, Tabs, Text } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'
import { Label } from '@/components/Label'

import { DebugSession } from '../types'

import { BrowserActionList } from './BrowserActionList'
import { BrowserDebugDrawer } from './BrowserDebugDrawer'

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
            <BrowserDebugDrawer.List session={session} />
          </Allotment.Pane>
          <Allotment.Pane snap minSize={150} preferredSize={300}>
            <Box height="100%" width="100%">
              <BrowserDebugDrawer.Content session={session} />
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Tabs.Root>
    </Flex>
  )
}
