import { Box, Table } from '@radix-ui/themes'

import { ProxyDataWithMatches } from '@/types'

import { HighlightedText } from '../HighlightedText'
import { MethodBadge } from '../MethodBadge'
import { ResponseStatusBadge } from '../ResponseStatusBadge'
import { TableCellWithTooltip } from '../TableCellWithTooltip'

import { SearchResults } from './SearchResults'
import { getRequestType } from './WebLogView.utils'

export interface RowProps {
  data: ProxyDataWithMatches
  isSelected?: boolean
  onSelectRequest: (data: ProxyDataWithMatches) => void
  filter?: string
}

export function Row({ data, onSelectRequest, isSelected, filter }: RowProps) {
  return (
    <>
      <TableRow
        data={data}
        onSelectRequest={onSelectRequest}
        isSelected={isSelected}
      >
        <MethodCell data={data} isSelected={isSelected} />
        <StatusCell data={data} />
        <RequestTypeCell data={data} />
        <HostCell data={data} />
        <PathCell data={data} />
      </TableRow>

      <SearchResults
        data={data}
        key={data.id}
        onSelectRequest={onSelectRequest}
        filter={filter}
      />
    </>
  )
}

export function TableRow({
  data,
  onSelectRequest,
  isSelected,
  children,
}: RowProps & { children: React.ReactNode }) {
  return (
    <Table.Row
      onClick={() => onSelectRequest(data)}
      css={{
        backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent',
        '&:hover': {
          backgroundColor: isSelected ? 'var(--accent-3)' : 'var(--accent-2)',
        },
      }}
    >
      {children}
    </Table.Row>
  )
}

export function MethodCell({
  data,
  isSelected,
}: {
  data: ProxyDataWithMatches
  isSelected?: boolean
}) {
  return (
    <Table.Cell
      css={{
        cursor: 'var(--cursor-button)',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        css={{
          width: '3px',
          backgroundColor: isSelected ? 'var(--accent-9)' : 'transparent',
          height: 'var(--table-cell-min-height)',
          marginRight: 'var(--space-2)',
        }}
      />
      <MethodBadge method={data.request.method}>
        <HighlightedText text={data.request.method} matches={data.matches} />
      </MethodBadge>
    </Table.Cell>
  )
}

export function StatusCell({ data }: { data: ProxyDataWithMatches }) {
  return (
    <Table.Cell>
      <ResponseStatusBadge status={data.response?.statusCode}>
        <HighlightedText
          text={data.response?.statusCode.toString() ?? '-'}
          matches={data.matches}
        />
      </ResponseStatusBadge>
    </Table.Cell>
  )
}

export function RequestTypeCell({ data }: { data: ProxyDataWithMatches }) {
  return <TableCellWithTooltip>{getRequestType(data)}</TableCellWithTooltip>
}

export function HostCell({ data }: { data: ProxyDataWithMatches }) {
  return (
    <TableCellWithTooltip>
      <HighlightedText text={data.request.host} matches={data.matches} />
    </TableCellWithTooltip>
  )
}

export function PathCell({ data }: { data: ProxyDataWithMatches }) {
  return (
    <TableCellWithTooltip>
      <HighlightedText text={data.request.path} matches={data.matches} />
    </TableCellWithTooltip>
  )
}
