import { css } from '@emotion/react'
import { Text, VisuallyHidden } from '@radix-ui/themes'
import { useCallback } from 'react'

import { useAutoScroll } from '@/hooks/useAutoScroll'
import { LogEntry } from '@/schemas/k6'

import { Table } from '../Table'

function formatTime(time: string) {
  const date = new Date(time)

  return date.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function findTableElement(element: HTMLElement): HTMLTableElement | null {
  let current: HTMLElement | null = element

  while (current !== null) {
    if (current instanceof HTMLTableElement) {
      return current
    }

    current = current.parentElement
  }

  return null
}

const colors: Record<LogEntry['level'], string> = {
  info: 'green',
  debug: 'blue',
  warning: 'orange',
  error: 'red',
}

const headerStyles = css`
  position: sticky;
  top: 0;
  height: 0;
  padding: 0;
  margin: 0;
  --table-row-background-color: var(--color-background);
`

interface LogsSectionProps {
  logs: LogEntry[]
  autoScroll: boolean
}

export function LogsSection({ logs, autoScroll }: LogsSectionProps) {
  const ref = useAutoScroll<HTMLTableElement>(logs, autoScroll)

  // Radix UI's Table component wraps the table element in a ScrollArea but in
  // order to autoscroll we need to get a ref to the table element. Ideally Radix
  // would provide a way to do this, but instead we have to get the ref to an
  // inner element and find the table element from there.
  const setTableRef = useCallback(
    (element: HTMLTableSectionElement | null) => {
      if (element === null) {
        return
      }

      const table = findTableElement(element)

      if (table === null) {
        return
      }

      ref.current = table
    },
    [ref]
  )

  return (
    <Table.Root
      size="1"
      layout="fixed"
      css={css`
        height: 100%;

        table {
          display: grid;
          grid-template-columns: 1fr auto;
        }

        thead,
        tbody,
        tr {
          display: grid;
          grid-column: 1 / -1;
          grid-template-columns: subgrid;
        }

        td {
          font-family: var(--code-font-family);
          font-size: 13px;
        }
      `}
    >
      <Table.Header ref={setTableRef}>
        <Table.Row
          css={css`
            height: 0;
            padding: 0;
            margin: 0;
          `}
        >
          <Table.ColumnHeaderCell css={headerStyles}>
            <VisuallyHidden>Message</VisuallyHidden>
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell css={headerStyles}>
            <VisuallyHidden>Time</VisuallyHidden>
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {logs.map((log, index) => (
          <Table.Row key={index}>
            <Table.Cell
              css={css`
                border-left: 4px solid var(--${colors[log.level]}-9);
              `}
            >
              <pre
                css={css`
                  margin: 0;
                `}
              >
                {log.msg}
              </pre>
            </Table.Cell>
            <Text
              asChild
              css={css`
                color: var(--gray-a9);
              `}
            >
              <Table.Cell align="right">{formatTime(log.time)}</Table.Cell>
            </Text>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
