import { css } from '@emotion/react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Flex, Separator, Text, VisuallyHidden } from '@radix-ui/themes'
import { ReactNode, useMemo, useState } from 'react'

import { LogEntry } from '@/schemas/k6'

import { AutoScrollArea } from '../AutoScrollArea'

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
  warning: 'yellow',
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
  font-size: var(--font-size-2);
  border: none;
  border-radius: var(--radius-2);
  cursor: pointer;
  color: var(--gray-11);
  background-color: transparent;

  &[data-state='on'] {
    background-color: var(--gray-a4);
  }
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

function LogMessage({ children }: { children: ReactNode }) {
  return (
    <Text size="2" color="gray" asChild>
      <Flex align="center" justify="center" height="100%" flexGrow="1">
        {children}
      </Flex>
    </Text>
  )
}

interface LogsContentProps {
  filter: ConsoleFilter
  logs: LogEntry[]
}

function LogsContent({ filter, logs }: LogsContentProps) {
  const filteredLogs = useMemo(() => {
    return logs.map(withSource).filter((log) => {
      return (
        filter.levels.includes(log.entry.level) &&
        filter.sources.includes(log.source)
      )
    })
  }, [logs, filter])

  if (logs.length === 0) {
    return <LogMessage>No logs available.</LogMessage>
  }

  if (filteredLogs.length === 0) {
    return <LogMessage>No logs match the filter.</LogMessage>
  }

  return (
    <table
      css={css`
        display: grid;
        align-items: center;
        grid-template-columns: 1fr auto auto;

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
      <thead>
        <tr
          css={css`
            height: 0;
            padding: 0;
            margin: 0;
          `}
        >
          <th>
            <VisuallyHidden>Message</VisuallyHidden>
          </th>
          <th>
            <VisuallyHidden>Source</VisuallyHidden>
          </th>
          <th>
            <VisuallyHidden>Time</VisuallyHidden>
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredLogs.map(({ source, entry }, index) => (
          <tr key={index}>
            <td
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
            </td>
            <Text
              asChild
              css={css`
                color: var(--gray-a9);
              `}
            >
              <td align="right">[{source}]</td>
            </Text>
            <Text
              asChild
              css={css`
                color: var(--gray-a9);
              `}
            >
              <td align="right">{formatTime(entry.time)}</td>
            </Text>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
interface ConsoleFilter {
  levels: Array<LogEntry['level']>
  sources: Array<ReturnType<typeof getSource>>
}

interface LogsSectionProps {
  filter: ConsoleFilter
  logs: LogEntry[]
  browser?: boolean
  script?: boolean
  runtime?: boolean
  autoScroll: boolean
  onFilterChange: (filter: ConsoleFilter) => void
}

export function LogsSection({
  filter,
  logs,
  browser = true,
  script = true,
  runtime = true,
  autoScroll,
  onFilterChange,
}: LogsSectionProps) {
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
          font-size: var(--font-size-2);
          line-height: 1em;
          flex-shrink: 0;
          border-bottom: 1px solid var(--gray-a6);
        `}
      >
        <div
          css={css`
            padding: var(--space-1) 0;
          `}
        >
          Filters:
        </div>
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
          {browser && (
            <ToggleGroup.Item
              value={'browser'}
              css={toggleItemStyles}
              aria-label={`Filter browser logs`}
            >
              Browser
            </ToggleGroup.Item>
          )}
          {script && (
            <ToggleGroup.Item
              value={'script'}
              css={toggleItemStyles}
              aria-label={`Filter script logs`}
            >
              Script
            </ToggleGroup.Item>
          )}
          {runtime && (
            <ToggleGroup.Item
              value={'runtime'}
              css={toggleItemStyles}
              aria-label={`Filter runtime logs`}
            >
              Runtime
            </ToggleGroup.Item>
          )}
        </ToggleGroup.Root>
      </Flex>
      <AutoScrollArea tail={autoScroll} items={logs.length}>
        <LogsContent filter={filter} logs={logs} />
      </AutoScrollArea>
    </Flex>
  )
}
