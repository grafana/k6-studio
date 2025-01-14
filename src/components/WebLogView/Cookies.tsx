import { Flex } from '@radix-ui/themes'

import { Cookie } from '@/types'
import { Table } from '@/components/Table'
import { HighlightedText } from '../HighlightedText'
import { SearchMatch } from '@/types/fuse'

export function Cookies({
  cookies = [],
  matches,
}: {
  cookies?: Cookie[]
  matches?: SearchMatch[]
}) {
  if (!cookies.length) {
    return (
      <Flex height="200px" justify="center" align="center">
        No cookies
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
            <Table.Cell>
              <HighlightedText
                text={name}
                matches={matches}
                highlightAllMatches
              />
            </Table.Cell>
            <Table.Cell>
              <HighlightedText
                text={value}
                matches={matches}
                highlightAllMatches
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
