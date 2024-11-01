import { Box, Table } from '@radix-ui/themes'

import { ProxyData } from '@/types'

import { MethodBadge } from '../MethodBadge'
import { ResponseStatusBadge } from '../ResponseStatusBadge'
import { TableCellWithTooltip } from '../TableCellWithTooltip'

interface RowProps {
  data: ProxyData
  isSelected?: boolean
  onSelectRequest: (data: ProxyData) => void
}

export function Row({ data, isSelected, onSelectRequest }: RowProps) {
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
        <MethodBadge method={data.request.method} />
      </Table.Cell>

      <Table.Cell>
        <ResponseStatusBadge status={data.response?.statusCode} />
      </Table.Cell>
      <TableCellWithTooltip>{data.request.host}</TableCellWithTooltip>
      <TableCellWithTooltip>{data.request.path}</TableCellWithTooltip>
    </Table.Row>
  )
}
