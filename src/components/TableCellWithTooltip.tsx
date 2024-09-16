import { Tooltip, Table, Text } from '@radix-ui/themes'
import { ReactNode, useState } from 'react'

export function TableCellWithTooltip({ children }: { children: ReactNode }) {
  const [isEllipsisActive, setIsEllipsisActive] = useState(false)

  const onTextRef = (node: HTMLTableDataCellElement) => {
    if (!node) return
    const isOverflowing = node.clientWidth !== node.scrollWidth
    setIsEllipsisActive(isOverflowing)
  }

  return (
    <Tooltip content={children} hidden={!isEllipsisActive} avoidCollisions>
      <Table.Cell
        css={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
        ref={onTextRef}
      >
        <Text size="1">{children}</Text>
      </Table.Cell>
    </Tooltip>
  )
}
