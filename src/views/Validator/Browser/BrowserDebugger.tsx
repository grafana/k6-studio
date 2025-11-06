import { css } from '@emotion/react'
import {
  Box,
  Flex,
  Reset,
  ScrollArea,
  Spinner,
  TabNav,
  Tabs,
  Text,
} from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { CircleCheckIcon, CircleXIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ChecksSection } from '@/components/Validator/ChecksSection'
import { LogsSection } from '@/components/Validator/LogsSection'
import { AnyBrowserAction, BrowserActionEvent } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { DebugSession } from '../types'

import { BrowserActionLocator } from './BrowserActionLocator'
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
          <Allotment.Pane snap minSize={400}>
            <Allotment>
              {/* <SessionReplay /> */}
              <Allotment.Pane minSize={400} preferredSize={600}>
                <Box
                  py="2"
                  px="3"
                  css={css`
                    border-bottom: 1px solid var(--gray-a5);
                  `}
                >
                  <Text size="2" weight="medium">
                    Browser actions
                  </Text>
                </Box>
                <BrowserActionList actions={session.browserActions} />
              </Allotment.Pane>
            </Allotment>
          </Allotment.Pane>
          <Allotment.Pane minSize={40} maxSize={40}>
            <TabNav.Root>
              <Tabs.List>
                <Tabs.Trigger value="network">Network</Tabs.Trigger>
                <Tabs.Trigger value="checks">Checks</Tabs.Trigger>
                <Tabs.Trigger value="console">Console</Tabs.Trigger>
              </Tabs.List>
            </TabNav.Root>
          </Allotment.Pane>
          <Allotment.Pane snap minSize={150}>
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

interface BrowserActionListProps {
  actions: BrowserActionEvent[]
}

function BrowserActionList({ actions }: BrowserActionListProps) {
  return (
    <ScrollArea>
      <Reset>
        <ul>
          {actions.map((action) => (
            <BrowserActionItem key={action.eventId} event={action} />
          ))}
        </ul>
      </Reset>
    </ScrollArea>
  )
}

function formatDuration(started: number, ended: number) {
  return `${((ended - started) / 1000).toFixed(1)}s`
}

interface BrowserActionTextProps {
  action: AnyBrowserAction
}

function BrowserActionText({ action }: BrowserActionTextProps) {
  switch (action.type) {
    case 'browserContext.*':
      return `Performed action ${action.method} on browser context`

    case 'page.goto':
      return `Navigate to ${action.url}`

    case 'page.reload':
      return `Reload page`

    case 'page.*':
      return `Performed action ${action.method} on page`

    case 'page.waitForNavigation':
      return <>Waiting for page navigation</>

    case 'locator.click':
      return (
        <>
          Click element <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.fill':
      return (
        <>
          Fill element <BrowserActionLocator locator={action.locator} /> with
          {`"${action.value}"`}
        </>
      )

    case 'locator.check':
      return (
        <>
          Check element <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.uncheck':
      return (
        <>
          Uncheck element <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.selectOption':
      return (
        <>
          Select options [
          {action.values
            .map((v) => v.value ?? v.index ?? v.label ?? '')
            .map((v) => `"${v}"`)
            .join(', ')}
          ] on <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.*':
      return (
        <>
          Performed action {action.method} on{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    default:
      return exhaustive(action)
  }
}

interface BrowserActionItemProps {
  event: BrowserActionEvent
}

function BrowserActionItem({ event }: BrowserActionItemProps) {
  const [ended, setEnded] = useState(
    event.type === 'end' ? event.timestamp.ended : Date.now()
  )

  useEffect(() => {
    if (event.type === 'end') {
      setEnded(event.timestamp.ended)

      return
    }

    const interval = setInterval(() => {
      setEnded(Date.now())
    }, 50)

    return () => clearInterval(interval)
  }, [event])

  const result = event.type === 'end' ? event.result : null

  return (
    <Text asChild size="2">
      <li
        css={css`
          display: grid;
          grid-template-columns: 24px 1fr auto;
          align-items: center;
          padding: var(--space-2);
          gap: var(--space-2);

          border-bottom: 1px solid var(--gray-5);
        `}
      >
        <Flex
          minWidth="20px"
          justify="center"
          align="center"
          css={css`
            svg.lucide {
              min-width: 20px;
              min-height: 20px;
            }
          `}
          gap="2"
        >
          {event.type === 'begin' && <Spinner />}
          {result?.type === 'success' && (
            <CircleCheckIcon color="var(--green-11)" />
          )}
          {result?.type === 'error' && <CircleXIcon color="var(--red-11)" />}
        </Flex>
        <div
          css={css`
            flex: 1 1 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          `}
        >
          <BrowserActionText action={event.action} />
        </div>
        <div>
          <div>{formatDuration(event.timestamp.started, ended)}</div>
        </div>
        {result?.type === 'error' && (
          <div
            css={css`
              color: var(--red-11);
              grid-column: 2 / span 1;
            `}
          >
            Error: {result.error}
          </div>
        )}
      </li>
    </Text>
  )
}
