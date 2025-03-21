import { Tooltip, Table, Text } from '@radix-ui/themes'
import { ComponentProps, useRef } from 'react'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'

export function TableCellWithTooltip({
  children,
  ...props
}: ComponentProps<typeof Table.Cell>) {
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
        {...props}
      >
        <Text size="1">{children}</Text>
      </Table.Cell>
    </Tooltip>
  )
}
