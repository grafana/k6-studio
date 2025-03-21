import { Table } from '@/components/Table'
import { RequestListProps } from '@/components/WebLogView'
import { RuleInstance } from '@/types/rules'

import { RequestRow } from './RequestRow'

export function RequestTable({
  requests,
  selectedRequestId,
  onSelectRequest,
  filter,
  selectedRuleInstance,
}: RequestListProps & { selectedRuleInstance?: RuleInstance }) {
  return (
    <Table.Root size="1" layout="fixed">
      <Table.Header css={{ textWrap: 'nowrap' }}>
        <Table.Row>
          <Table.ColumnHeaderCell width="70px">Method</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="60px">Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="50px">Type</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="20%">Host</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell width="80%">Path</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {requests.map((data) => (
          <RequestRow
            key={data.id}
            data={data}
            isSelected={selectedRequestId === data.id}
            onSelectRequest={onSelectRequest}
            filter={filter}
            selectedRuleInstance={selectedRuleInstance}
          />
        ))}
      </Table.Body>
    </Table.Root>
  )
}
