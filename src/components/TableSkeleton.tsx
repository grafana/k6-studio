import { Skeleton, Table } from '@radix-ui/themes'
import { ComponentProps } from 'react'

interface TableSkeletonProps {
  rootProps: ComponentProps<typeof Table.Root>
  rows?: number
  columns?: number
}

export function TableSkeleton({
  rootProps,
  rows = 5,
  columns = 3,
}: TableSkeletonProps) {
  return (
    <Table.Root {...rootProps} aria-busy>
      <Table.Header>
        <Table.Row>
          {Array.from({ length: columns }).map((_, i) => (
            <Table.ColumnHeaderCell key={i}>
              <Skeleton width={getRandomWidth()} />
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.from({ length: rows }).map((_, i) => (
          <Table.Row key={i}>
            {Array.from({ length: columns }).map((_, j) => (
              <Table.Cell key={j}>
                <Skeleton width={getRandomWidth()} />
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

function getRandomWidth(): string {
  const min = 3
  const max = 8
  const width = (Math.floor(Math.random() * (max - min + 1)) + min) * 10

  return `${width}px`
}
