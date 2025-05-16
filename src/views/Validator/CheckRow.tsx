import { Table } from '@radix-ui/themes'
import { CircleCheckIcon, CircleXIcon } from 'lucide-react'

import { K6Check } from '@/types'

import { hasFailures, getPassPercentage } from './ChecksSection.utils'

export function CheckRow({ check }: { check: K6Check }) {
  return (
    <Table.Row key={check.id}>
      <Table.RowHeaderCell>
        {hasFailures(check) && <CircleXIcon color="var(--red-11)" />}
        {!hasFailures(check) && <CircleCheckIcon color="var(--green-11)" />}
      </Table.RowHeaderCell>
      <Table.Cell>{check.name}</Table.Cell>
      <Table.Cell align="right">
        {getPassPercentage(check).toFixed(2)}%
      </Table.Cell>
      <Table.Cell align="right">{check.passes}</Table.Cell>
      <Table.Cell align="right">{check.fails}</Table.Cell>
    </Table.Row>
  )
}
