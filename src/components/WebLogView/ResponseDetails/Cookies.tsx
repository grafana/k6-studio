import { Flex, Table } from '@radix-ui/themes'

import { ProxyData } from '@/types'

export function Cookies({ data }: { data: ProxyData }) {
  const cookies = data.response?.cookies ?? []

  if (!cookies.length) {
    return (
      <Flex height="200px" justify="center" align="center">
        Cookies not available
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
        {cookies.map(([name, value], index) => (
          <Table.Row key={index}>
            <Table.Cell>{name}</Table.Cell>
            <Table.Cell>{value}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
