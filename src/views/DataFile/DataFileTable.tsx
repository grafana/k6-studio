import { Callout, Table } from '@radix-ui/themes'

import { TableCellWithTooltip } from '@/components/TableCellWithTooltip'
import { DataFilePreview } from '@/types/testData'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { renderDataFileValue } from '@/utils/dataFile'

interface DataFileTableProps {
  preview: DataFilePreview
  isLoading: boolean
}

export function DataFileTable({ preview }: DataFileTableProps) {
  return (
    <>
      <Callout.Root variant="soft" color="indigo">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          <strong>{preview.data.length}</strong> out of{' '}
          <strong>{preview.total}</strong> items.
          {preview.total > preview.data.length && (
            <>
              <br />
              To see full content, open the file in default app.
            </>
          )}
        </Callout.Text>
      </Callout.Root>
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
                  {renderDataFileValue(item[prop])}
                </TableCellWithTooltip>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  )
}
