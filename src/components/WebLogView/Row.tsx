import { Box, Table } from '@radix-ui/themes'

import { ProxyDataWithMatches } from '@/types'

import { MethodBadge } from '../MethodBadge'
import { ResponseStatusBadge } from '../ResponseStatusBadge'
import { TableCellWithTooltip } from '../TableCellWithTooltip'
import { HighlightedText } from '../HighlightedText'
import { getRequestType } from './WebLogView.utils'
import { useInspectRequest } from './Details.hooks'
import { SearchResults } from './SearchResults'

interface RowProps {
  data: ProxyDataWithMatches
  onSelectRequestId: (id?: string) => void
}

export function Row({ data, onSelectRequestId }: RowProps) {
  const { selectedRequest } = useInspectRequest()
  const isSelected = data.id === selectedRequest?.id

  return (
    <>
      <Table.Row
        onClick={() => onSelectRequestId(data.id)}
        css={{
          backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent',
          '&:hover': {
            backgroundColor: isSelected ? 'var(--accent-3)' : 'var(--accent-2)',
          },
        }}
      >
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
            <HighlightedText
              text={data.request.method}
              matches={data.matches}
            />
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
      </Table.Row>

      <SearchResults
        data={data}
        key={data.id}
        onSetSelectedRequestId={onSelectRequestId}
      />
    </>
  )
}
