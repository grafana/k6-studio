import { Flex } from '@radix-ui/themes'

import { Request } from '@/types'
import { Table } from '@/components/Table'

export function QueryParams({ request }: { request: Request }) {
  if (request.query.length === 0) {
    return (
      <Flex height="100%" justify="center" align="center">
        No query parameters
      </Flex>
    )
  }
  return (
    <Table.Root size="1" variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {request.query.map(([key, value]) => (
          <Table.Row key={key}>
            <Table.Cell>{key}</Table.Cell>
            <Table.Cell>{value}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
