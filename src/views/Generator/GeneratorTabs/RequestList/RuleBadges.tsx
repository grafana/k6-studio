import { ProxyData } from '@/types'
import { RuleInstance } from '@/types/rules'
import { Badge, Flex, Strong } from '@radix-ui/themes'
import { useMemo } from 'react'

export function RuleBadges({
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
