import { safeJsonParse } from '@/utils/json'
import { Table } from '@/components/Table'

export function FormPayloadPreview({
  payloadJsonString,
}: {
  payloadJsonString: string
}) {
  const contentObject = safeJsonParse<Record<string, string>>(payloadJsonString)

  return (
    <Table.Root size="1" variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {contentObject &&
          Object.entries(contentObject).map(([key, value]) => (
            <Table.Row key={key}>
              <Table.Cell>{key}</Table.Cell>
              <Table.Cell>{value}</Table.Cell>
            </Table.Row>
          ))}
      </Table.Body>
    </Table.Root>
  )
}
