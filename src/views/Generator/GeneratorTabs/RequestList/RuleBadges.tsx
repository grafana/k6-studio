import { Badge, Flex, Strong, Tooltip } from '@radix-ui/themes'
import { isEqual } from 'lodash-es'
import { PencilIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useOriginalRequest } from '@/store/generator/hooks/useOriginalRequest'
import { ProxyData } from '@/types'
import { RuleInstance } from '@/types/rules'

export function RuleBadges({
  selectedRuleInstance,
  data,
}: {
  selectedRuleInstance?: RuleInstance
  data: ProxyData
}) {
  return (
    <Flex justify="end" align="center" height="100%" pr="2" gap="2">
      <ExtractorBadge selectedRuleInstance={selectedRuleInstance} data={data} />
      <MatchBadge selectedRuleInstance={selectedRuleInstance} data={data} />
      <ModifiedBadge data={data} />
    </Flex>
  )
}

function MatchBadge({
  selectedRuleInstance,
  data,
}: {
  selectedRuleInstance?: RuleInstance
  data: ProxyData
}) {
  const isMatch = useMemo(() => {
    if (!selectedRuleInstance) {
      return false
    }

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
  selectedRuleInstance?: RuleInstance
  data: ProxyData
}) {
  const isExtractor = useMemo(() => {
    if (!selectedRuleInstance) {
      return false
    }

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

function ModifiedBadge({ data }: { data: ProxyData }) {
  const originalRequest = useOriginalRequest(data.id)

  if (isEqual(originalRequest, data.request)) {
    return
  }

  return (
    <Tooltip content="Request modified by rules">
      <PencilIcon color="var(--green-9)" />
    </Tooltip>
  )
}
