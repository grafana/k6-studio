import { css } from '@emotion/react'
import { Flex, Text } from '@radix-ui/themes'
import { ReactNode, useMemo, useState } from 'react'

import { AutoScrollArea } from '@/components/AutoScrollArea'
import { LogEntry } from '@/schemas/k6'

import { LogFilter } from './LogFilter'
import { getSource, withSource } from './LogsSection.utils'
import { LogsTable } from './LogsTable'
import { ConsoleFilter } from './types'

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

  return <LogsTable logs={filteredLogs} />
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
        <LogFilter
          filter={filter}
          browser={browser}
          script={script}
          runtime={runtime}
          onChange={onFilterChange}
        />
      </Flex>
      <AutoScrollArea tail={autoScroll} items={logs.length}>
        <LogsContent filter={filter} logs={logs} />
      </AutoScrollArea>
    </Flex>
  )
}
