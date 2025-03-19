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
import { ProxyData } from '@/types'
import { RuleInstance } from '@/types/rules'
import { Badge, Flex, Strong } from '@radix-ui/themes'
import { useMemo } from 'react'

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

function RuleBadges({
  selectedRuleInstance,
  data,
}: {
  selectedRuleInstance?: RuleInstance
  data: ProxyData
}) {
  if (!selectedRuleInstance) {
    return null
  }

  return (
    <Flex justify="end" align="center" height="100%" pr="2" gap="2">
      <ExtractorBadge selectedRuleInstance={selectedRuleInstance} data={data} />
      <MatchBadge selectedRuleInstance={selectedRuleInstance} data={data} />
    </Flex>
  )
}

function MatchBadge({
  selectedRuleInstance,
  data,
}: {
  selectedRuleInstance: RuleInstance
  data: ProxyData
}) {
  const isMatch = useMemo(() => {
    return selectedRuleInstance.state.matchedRequestIds.includes(data.id)
  }, [selectedRuleInstance, data.id])

  if (!isMatch) {
    return null
  }

  return (
    <Badge color="green" size="1">
      <Strong>Match</Strong>
    </Badge>
  )
}

function ExtractorBadge({
  selectedRuleInstance,
  data,
}: {
  selectedRuleInstance: RuleInstance
  data: ProxyData
}) {
  const isExtractor = useMemo(() => {
    if (selectedRuleInstance.type !== 'correlation') {
      return false
    }

    return selectedRuleInstance.state.responsesExtracted.some(
      (request) => request.id === data.id
    )
  }, [selectedRuleInstance, data.id])

  if (!isExtractor) {
    return null
  }

  return (
    <Badge color="blue" size="1">
      <Strong>Value extracted</Strong>
    </Badge>
  )
}
