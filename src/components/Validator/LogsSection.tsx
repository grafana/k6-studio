import { css } from '@emotion/react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Flex, Separator, Text, VisuallyHidden } from '@radix-ui/themes'
import { useCallback, useMemo, useState } from 'react'

import { useAutoScroll } from '@/hooks/useAutoScroll'
import { LogEntry } from '@/schemas/k6'

import { Table } from '../Table'

function isLogSource(value: string) {
  return value === 'browser' || value === 'runtime' || value === 'script'
}

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

const ALL_LOG_LEVELS: Array<LogEntry['level']> = [
  'info',
  'debug',
  'warning',
  'error',
]

const ALL_LOG_SOURCES: Array<ReturnType<typeof getSource>> = [
  'browser',
  'runtime',
  'script',
]

const toggleGroupStyles = css`
  display: flex;
  gap: var(--space-1);
`

const toggleItemStyles = css`
  box-sizing: border-box;
  padding: var(--space-1) var(--space-2);
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-2);
  cursor: pointer;
  color: var(--gray-11);
  background-color: transparent;

  &:hover,
  &[data-state='on'] {
    background-color: var(--gray-a4);
  }
`

const headerStyles = css`
  position: sticky;
  top: 0;
  height: 0;
  padding: 0;
  margin: 0;
  --table-row-background-color: var(--color-background);
`

export function useConsoleFilter() {
  const [filter, setFilter] = useState<ConsoleFilter>({
    levels: ALL_LOG_LEVELS,
    sources: ALL_LOG_SOURCES,
  })

  return {
    filter,
    onFilterChange: setFilter,
  }
}

interface ConsoleFilter {
  levels: Array<LogEntry['level']>
  sources: Array<ReturnType<typeof getSource>>
}

interface LogsSectionProps {
  filter: ConsoleFilter
  logs: LogEntry[]
  autoScroll: boolean
  onFilterChange: (filter: ConsoleFilter) => void
}

export function LogsSection({
  filter,
  logs,
  autoScroll,
  onFilterChange,
}: LogsSectionProps) {
  const ref = useAutoScroll<HTMLTableElement>(logs, autoScroll)

  const formattedLogs = useMemo(() => {
    return logs.map(withSource).filter((log) => {
      return (
        filter.levels.includes(log.entry.level) &&
        filter.sources.includes(log.source)
      )
    })
  }, [logs, filter])

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
    onFilterChange({
      ...filter,
      levels: values.filter(isLogLevel),
    })
  }

  const handleLogSourcesChange = (values: string[]) => {
    onFilterChange({
      ...filter,
      sources: values.filter(isLogSource),
    })
  }

  return (
    <Flex direction="column" height="100%">
      <Flex
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
        <ToggleGroup.Root
          type="multiple"
          value={filter.levels}
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
        <Separator orientation="vertical" />
        <ToggleGroup.Root
          type="multiple"
          value={filter.sources}
          css={toggleGroupStyles}
          aria-label="Filter by log source"
          onValueChange={handleLogSourcesChange}
        >
          <ToggleGroup.Item
            value={'browser'}
            css={toggleItemStyles}
            aria-label={`Filter browser logs`}
          >
            Browser
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={'script'}
            css={toggleItemStyles}
            aria-label={`Filter script logs`}
          >
            Script
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={'runtime'}
            css={toggleItemStyles}
            aria-label={`Filter runtime logs`}
          >
            Runtime
          </ToggleGroup.Item>
        </ToggleGroup.Root>
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
