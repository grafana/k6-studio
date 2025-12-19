import { css } from '@emotion/react'
import { Flex, Tabs } from '@radix-ui/themes'

import { LogsSection } from '@/components/Validator/LogsSection'

import { DebugSession } from '../types'

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

interface BrowserDebugDrawerProps {
  className?: string
  session: DebugSession
  onExpand: () => void
}

export function BrowserDebugDrawer({
  className,
  session,
  onExpand,
}: BrowserDebugDrawerProps) {
  return (
    <Tabs.Root asChild className={className} defaultValue="console">
      <Flex direction="column">
        <Tabs.List
          css={css`
            flex-shrink: 0;
          `}
        >
          <Tabs.Trigger value="console" onClick={onExpand}>
            Console ({session.logs.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="network" onClick={onExpand}>
            Network ({session.requests.length})
          </Tabs.Trigger>
        </Tabs.List>
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
              <NetworkInspector session={session} />
            </div>
          </Tabs.Content>
        </Flex>
      </Flex>
    </Tabs.Root>
  )
}
