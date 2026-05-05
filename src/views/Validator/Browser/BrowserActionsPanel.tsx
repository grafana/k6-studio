import { css } from '@emotion/react'
import { Flex, Heading, Switch, Text } from '@radix-ui/themes'
import { useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'
import { Label } from '@/components/Label'

import { DebuggerEmptyState } from '../DebuggerEmptyState'
import { DebugSession } from '../types'

import { BrowserActionList } from './BrowserActionList'

interface BrowserActionsPanelProps {
  session: DebugSession
  onDebugScript: () => void
}

export function BrowserActionsPanel({
  session,
  onDebugScript,
}: BrowserActionsPanelProps) {
  const [tailActions, setTailActions] = useState(true)

  const handleActionsScrollBack = () => {
    setTailActions(false)
  }

  return (
    <Flex direction="column" height="100%">
      <Flex
        justify="between"
        pr="2"
        css={css`
          box-shadow: inset 0 -1px 0 0 var(--gray-a5);
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
            Browser actions ({session.browser.actions.length})
          </Heading>
        </Flex>

        {session.state === 'running' && (
          <Flex asChild gap="2" align="center">
            <Label>
              <Text size="2">Tail log</Text>
              <Switch checked={tailActions} onCheckedChange={setTailActions} />
            </Label>
          </Flex>
        )}
      </Flex>
      <AutoScrollArea
        tail={session.state === 'running' && tailActions}
        items={session.browser.actions.length}
        onScrollBack={handleActionsScrollBack}
      >
        {session.state === 'pending' && (
          <DebuggerEmptyState onDebugScript={onDebugScript}>
            Debug the script to inspect browser actions.
          </DebuggerEmptyState>
        )}
        {session.state !== 'pending' && (
          <BrowserActionList actions={session.browser.actions} />
        )}
      </AutoScrollArea>
    </Flex>
  )
}
