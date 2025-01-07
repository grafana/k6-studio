import { Flex } from '@radix-ui/themes'

import { Request } from '@/types'
import { Table } from '@/components/Table'
import { SearchMatch } from '@/types/fuse'
import { HighlightedText } from '@/components/HighlightedText'

export function QueryParams({
  request,
  matches,
}: {
  request: Request
  matches?: SearchMatch[]
}) {
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
            <Table.Cell>
              <HighlightedText text={key} matches={matches} />
            </Table.Cell>
            <Table.Cell>
              <HighlightedText text={value} matches={matches} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
