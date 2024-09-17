import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { Tooltip, Table, Text } from '@radix-ui/themes'
import { ReactNode, useRef } from 'react'

export function TableCellWithTooltip({ children }: { children: ReactNode }) {
  const cellRef = useRef<HTMLTableCellElement>(null)
  const isEllipsisActive = useOverflowCheck(cellRef)

  return (
    <Tooltip content={children} hidden={!isEllipsisActive} avoidCollisions>
      <Table.Cell
        css={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
        ref={cellRef}
      >
        <Text size="1">{children}</Text>
      </Table.Cell>
    </Tooltip>
  )
}
