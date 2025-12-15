import { css } from '@emotion/react'
import { Flex, Tabs } from '@radix-ui/themes'

import { ChecksSection } from '@/components/Validator/ChecksSection'
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
  session: DebugSession
}

function List({ session }: BrowserDebugDrawerProps) {
  return (
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
  )
}

function Content({ session }: BrowserDebugDrawerProps) {
  return (
    <Flex direction="column" align="stretch" height="100%" overflow="hidden">
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
      <TabContent value="checks">
        <ChecksSection isRunning={false} checks={session.checks} />
      </TabContent>
    </Flex>
  )
}

export const BrowserDebugDrawer = {
  List,
  Content,
}
