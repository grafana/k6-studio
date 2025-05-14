import { Flex } from '@radix-ui/themes'

import { HighlightedText } from '@/components/HighlightedText'
import { Table } from '@/components/Table'
import { TextWithTooltip } from '@/components/TextWithTooltip'
import {
  HostCell,
  MethodCell,
  RequestTypeCell,
  RowProps,
  StatusCell,
  TableRow,
} from '@/components/WebLogView'
import { SearchResults } from '@/components/WebLogView/SearchResults'
import { RuleInstance } from '@/types/rules'

import { RuleBadges } from './RuleBadges'

export function RequestRow({
  data,
  onSelectRequest,
  isSelected,
  filter,
  selectedRuleInstance,
}: RowProps & { selectedRuleInstance?: RuleInstance }) {
  return (
    <>
      <TableRow
        data={data}
        onSelectRequest={onSelectRequest}
        isSelected={isSelected}
      >
        <MethodCell data={data} isSelected={isSelected} />
        <StatusCell data={data} />
        <RequestTypeCell data={data} />
        <HostCell data={data} />

        <Table.Cell css={{ padding: 0 }}>
          <Flex justify="between" align="center" height="100%" gap="1">
            <TextWithTooltip size="1">
              <HighlightedText
                text={data.request.path}
                matches={data.matches}
                highlightAllMatches
              />
            </TextWithTooltip>
            <RuleBadges
              selectedRuleInstance={selectedRuleInstance}
              data={data}
            />
          </Flex>
        </Table.Cell>
      </TableRow>

      <SearchResults
        data={data}
        key={data.id}
        onSelectRequest={onSelectRequest}
        filter={filter}
      />
    </>
  )
}
