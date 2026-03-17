import { css } from '@emotion/react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Flex, Text, VisuallyHidden } from '@radix-ui/themes'
import { useCallback, useState } from 'react'

import { useAutoScroll } from '@/hooks/useAutoScroll'
import { LogEntry } from '@/schemas/k6'

import { Table } from '../Table'

function isLogLevel(value: string) {
  return (
    value === 'debug' ||
    value === 'info' ||
    value === 'warning' ||
    value === 'error'
  )
}

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

/**
 * LogEntry has a source property but it's not really reliable and doesn't let us
 * distinguish between logs from the browser module and logs from the actual browser,
 * so we use our own source mappings.
 */
function getSource(entry: LogEntry): string {
  if (entry.process === 'browser') {
    return 'browser'
  }

  // Console is ambiguous in this context because it could be referring to the console
  // API in k6 or in the browser. To avoid confusion we re-map it to "script".
  if (entry.source === 'console') {
    return 'script'
  }

  return 'runtime'
}

function withSource(entry: LogEntry) {
  return {
    source: getSource(entry),
    entry,
  }
}

const colors: Record<LogEntry['level'], string> = {
  info: 'green',
  debug: 'blue',
  warning: 'orange',
  error: 'red',
}

const DEFAULT_LOG_LEVELS: Array<LogEntry['level']> = [
  'info',
  'debug',
  'warning',
  'error',
]

const toggleGroupStyles = css`
  display: flex;
  gap: var(--space-1);

  [data-state='on'] {
    background-color: var(--gray-a7);
    color: var(--gray-12);
  }

  [data-state='off'] {
    background-color: transparent;
    color: var(--gray-11);
  }

  [data-state='off']:hover {
    background-color: var(--gray-a4);
  }
`

const toggleItemStyles = css`
  padding: var(--space-1) var(--space-2);
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-2);
  cursor: pointer;
`

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

  const [logLevels, setLogLevels] = useState(DEFAULT_LOG_LEVELS)

  const formattedLogs = logs
    .map(withSource)
    .filter((log) => logLevels.includes(log.entry.level))

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

  const handleLogLevelsChange = (values: string[]) => {
    setLogLevels(values.filter(isLogLevel))
  }

  return (
    <Flex direction="column" height="100%">
      <Flex
        asChild
        justify="end"
        align="center"
        px="2"
        py="1"
        gap="2"
        minHeight="40px"
        css={css`
          flex-shrink: 0;
          border-bottom: 1px solid var(--gray-a6);
        `}
      >
        <header>
          <ToggleGroup.Root
            type="multiple"
            value={logLevels}
            css={toggleGroupStyles}
            aria-label="Filter by log level"
            onValueChange={handleLogLevelsChange}
          >
            <ToggleGroup.Item
              value={'debug'}
              css={toggleItemStyles}
              aria-label={`Filter debug logs`}
            >
              Debug
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value={'info'}
              css={toggleItemStyles}
              aria-label={`Filter info logs`}
            >
              Info
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value={'warning'}
              css={toggleItemStyles}
              aria-label={`Filter warning logs`}
            >
              Warning
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value={'error'}
              css={toggleItemStyles}
              aria-label={`Filter error logs`}
            >
              Error
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </header>
      </Flex>
      <Flex
        css={css`
          flex: 1;
          min-height: 0;
        `}
      >
        <Table.Root
          size="1"
          layout="fixed"
          css={css`
            height: 100%;
            flex: 1;

            table {
              display: grid;
              align-items: center;
              grid-template-columns: 1fr auto auto;
            }

            thead,
            tbody,
            tr {
              display: grid;
              grid-column: 1 / -1;
              grid-template-columns: subgrid;
            }

            tr {
              padding-right: var(--space-2);
            }

            td {
              font-family: var(--code-font-family);
              font-size: 13px;
              padding: var(--space-2) var(--space-1);
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
                <VisuallyHidden>Source</VisuallyHidden>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell css={headerStyles}>
                <VisuallyHidden>Time</VisuallyHidden>
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {formattedLogs.map(({ source, entry }, index) => (
              <Table.Row key={index}>
                <Table.Cell
                  css={css`
                    border-left: 4px solid var(--${colors[entry.level]}-9);
                    && {
                      padding-left: var(--space-2);
                    }
                  `}
                >
                  <pre
                    css={css`
                      margin: 0;
                    `}
                  >
                    {entry.msg}
                  </pre>
                </Table.Cell>
                <Text
                  asChild
                  css={css`
                    color: var(--gray-a9);
                  `}
                >
                  <Table.Cell align="right">[{source}]</Table.Cell>
                </Text>
                <Text
                  asChild
                  css={css`
                    color: var(--gray-a9);
                  `}
                >
                  <Table.Cell align="right">
                    {formatTime(entry.time)}
                  </Table.Cell>
                </Text>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Flex>
  )
}
