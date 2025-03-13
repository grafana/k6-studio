import { Cells, RowProps } from '@/components/WebLogView'
import { SearchResults } from '@/components/WebLogView/SearchResults'
import { Badge, Flex, Strong, Table } from '@radix-ui/themes'
import { useMemo } from 'react'

export function RequestRow({
  data,
  onSelectRequest,
  isSelected,
  filter,
  highlightedRequestIds,
}: RowProps & { highlightedRequestIds?: string[] }) {
  const isMatch = useMemo(() => {
    if (!highlightedRequestIds) {
      return false
    }

    return highlightedRequestIds.includes(data.id)
  }, [highlightedRequestIds, data.id])
  return (
    <>
      <Table.Row
        onClick={() => onSelectRequest(data)}
        css={{
          backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent',
          '&:hover': {
            backgroundColor: isSelected ? 'var(--accent-3)' : 'var(--accent-2)',
          },
        }}
      >
        <Cells data={data} isSelected={isSelected} />
        {highlightedRequestIds && (
          <Table.Cell css={{ padding: 0 }}>
            {isMatch && (
              <Flex justify="end" align="center" height="100%" pr="2">
                <Badge color="green" size="1">
                  <Strong>Match</Strong>
                </Badge>
              </Flex>
            )}
          </Table.Cell>
        )}
      </Table.Row>

      <SearchResults
        data={data}
        key={data.id}
        onSelectRequest={onSelectRequest}
        filter={filter}
        colSpan={highlightedRequestIds ? 6 : 5}
      />
    </>
  )
}
