import { css } from '@emotion/react'
import { Box, Flex, Reset, Spinner, Text } from '@radix-ui/themes'
import { CircleCheckIcon, CircleXIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ClickText } from '@/components/Browser/ClickText'
import { SelectOptions } from '@/components/Browser/SelectOptions'
import { AnyBrowserAction, BrowserActionEvent } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { BrowserActionLocator } from './BrowserActionLocator'

interface BrowserActionListProps {
  actions: BrowserActionEvent[]
}

export function BrowserActionList({ actions }: BrowserActionListProps) {
  return (
    <Reset>
      <ul>
        {actions.map((action) => (
          <BrowserActionItem key={action.eventId} event={action} />
        ))}
      </ul>
    </Reset>
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
      return <>Performed action {action.method} on browser context</>

    case 'page.goto':
      return (
        <>
          Navigate to <strong>{action.url}</strong>
        </>
      )

    case 'page.reload':
      return <>Reload page</>

    case 'page.waitForNavigation':
      return <>Waiting for page navigation</>

    case 'page.*':
      return <>Performed action {action.method} on page</>

    case 'locator.click':
      return (
        <>
          <ClickText
            details={{
              button: 'left',
              modifiers: { alt: false, ctrl: false, meta: false, shift: false },
            }}
          />{' '}
          on <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.fill':
      return (
        <>
          Type <code>{`"${action.value}"`}</code> into{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.check':
      return (
        <>
          Check <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.uncheck':
      return (
        <>
          Uncheck <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.selectOption':
      return (
        <>
          Select options <SelectOptions options={action.values} /> on{' '}
          <BrowserActionLocator locator={action.locator} />
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
        <Box pr="2">
          <div>{formatDuration(event.timestamp.started, ended)}</div>
        </Box>
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
