import { Callout, Table, Text } from '@radix-ui/themes'

import { TableCellWithTooltip } from '@/components/TableCellWithTooltip'
import { TableSkeleton } from '@/components/TableSkeleton'
import { DataFilePreview, DataRecord } from '@/types/testData'
import { InfoCircledIcon } from '@radix-ui/react-icons'

interface DataFileTableProps {
  preview?: DataFilePreview | null
  isLoading: boolean
}

export function DataFileTable({ preview, isLoading }: DataFileTableProps) {
  if (isLoading) {
    return <TableSkeleton rootProps={{ size: '1' }} columns={8} rows={10} />
  }

  if (!preview) {
    return (
      <Callout.Root variant="surface" color="blue">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>FIle is too large to preview</Callout.Text>
      </Callout.Root>
    )
  }

  return (
    <>
      <Table.Root size="1">
        <Table.Header>
          <Table.Row>
            {preview.props.map((prop) => (
              <Table.ColumnHeaderCell key={prop}>{prop}</Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {preview.data.map((item, i) => (
            <Table.Row key={i}>
              {preview.props.map((prop) => (
                <TableCellWithTooltip key={prop}>
                  {renderValue(item[prop])}
                </TableCellWithTooltip>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Text size="2">
        <strong>{preview.data.length}</strong> out of{' '}
        <strong>{preview.total}</strong>{' '}
        {preview.type === 'csv' ? 'rows' : 'items'}.
        {preview.total > preview.data.length && (
          <>
            <br />
            To see full content, open the file in default app.
          </>
        )}
      </Text>
    </>
  )
}

function renderValue(value?: DataRecord[keyof DataRecord]) {
  if (value === undefined) {
    return null
  }

  if (value === null) {
    return 'null'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return value
}
