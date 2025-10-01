import { css } from '@emotion/react'
import { Text } from '@radix-ui/themes'
import { useCallback } from 'react'

import { useAutoScroll } from '@/hooks/useAutoScroll'
import { LogEntry } from '@/schemas/k6'

import { Table } from '../Table'

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

        td {
          font-family: var(--code-font-family);
        }
      `}
    >
      <Table.Header ref={setTableRef}>
        <Table.Row>
          <Table.ColumnHeaderCell css={headerStyles} width="230px">
            Time
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell css={headerStyles}>
            Message
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {logs.map((log, index) => (
          <Table.Row key={index}>
            <Table.Cell
              css={css`
                border-left: 3px solid var(--${colors[log.level]}-9);
              `}
            >
              <Text>{log.time}</Text>
            </Table.Cell>
            <Table.Cell>
              <pre
                css={css`
                  margin: 0;
                `}
              >
                {log.msg}
              </pre>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
