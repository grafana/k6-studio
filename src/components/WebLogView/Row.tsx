import { Box, Table } from '@radix-ui/themes'

import { ProxyDataWithMatches } from '@/types'

import { MethodBadge } from '../MethodBadge'
import { ResponseStatusBadge } from '../ResponseStatusBadge'
import { TableCellWithTooltip } from '../TableCellWithTooltip'
import { HighlightedText } from '../HighlightedText'
import { getRequestType } from './WebLogView.utils'
import { SearchResults } from './SearchResults'

export interface RowProps {
  data: ProxyDataWithMatches
  isSelected?: boolean
  onSelectRequest: (data: ProxyDataWithMatches) => void
  filter?: string
  className?: string
}

export function Row({
  data,
  onSelectRequest,
  isSelected,
  filter,
  className,
}: RowProps) {
  return (
    <>
      <Table.Row
        onClick={() => onSelectRequest(data)}
        className={className}
        css={{
          backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent',
          '&:hover': {
            backgroundColor: isSelected ? 'var(--accent-3)' : 'var(--accent-2)',
          },
        }}
      >
        <Cells data={data} isSelected={isSelected} />
      </Table.Row>

      <SearchResults
        data={data}
        key={data.id}
        onSelectRequest={onSelectRequest}
        filter={filter}
      />
    </>
  )
}

function Cells({
  data,
  isSelected,
}: {
  data: ProxyDataWithMatches
  isSelected?: boolean
}) {
  return (
    <>
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

      <Table.Cell>
        <ResponseStatusBadge status={data.response?.statusCode}>
          <HighlightedText
            text={data.response?.statusCode.toString() ?? '-'}
            matches={data.matches}
          />
        </ResponseStatusBadge>
      </Table.Cell>
      <TableCellWithTooltip>{getRequestType(data)}</TableCellWithTooltip>
      <TableCellWithTooltip>
        <HighlightedText text={data.request.host} matches={data.matches} />
      </TableCellWithTooltip>
      <TableCellWithTooltip>
        <HighlightedText text={data.request.path} matches={data.matches} />
      </TableCellWithTooltip>
    </>
  )
}
