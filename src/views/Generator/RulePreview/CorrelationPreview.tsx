import { Box, Callout, Code, Heading, ScrollArea } from '@radix-ui/themes'
import { CorrelationRule } from '@/types/rules'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { ProxyData, Request } from '@/types'
import { useMemo } from 'react'
import { WebLogView } from '@/components/WebLogView'
import { applyRules } from '@/rules/rules'

export function CorrelationPreview({
  rule,
  selectedRequest,
  onSelectRequest,
}: {
  rule: CorrelationRule
  selectedRequest: ProxyData | null
  onSelectRequest: (request: ProxyData | null) => void
}) {
  const requests = useGeneratorStore(selectFilteredRequests)
  const rules = useGeneratorStore((state) => state.rules)

  const preview = useMemo(() => {
    const preceedingAndSelectedRule = rules.slice(0, rules.indexOf(rule) + 1)
    const { ruleInstances } = applyRules(requests, preceedingAndSelectedRule)

    const selectedRuleInstance = ruleInstances.find(
      (ruleInstance) => ruleInstance.rule.id === rule.id
    )

    if (!selectedRuleInstance || selectedRuleInstance.type !== 'correlation') {
      return null
    }

    return selectedRuleInstance.state
  }, [rules, requests, rule])

  if (!preview?.extractedValue) {
    return (
      <Box p="2">
        <Callout.Root color="amber" role="alert" variant="surface">
          <Callout.Text wrap="balance">No requests matched</Callout.Text>
        </Callout.Root>
      </Box>
    )
  }

  return (
    <Box height="100%">
      <ScrollArea scrollbars="vertical">
        {preview.extractedValue && (
          <>
            <Heading size="2" m="2">
              Requests matched
            </Heading>
            <Box>
              <WebLogView
                requests={preview.responsesExtracted}
                onSelectRequest={onSelectRequest}
                selectedRequestId={selectedRequest?.id}
              />
            </Box>
            <Heading size="2" m="2">
              Extracted value:{' '}
            </Heading>
            <Box px="2">
              <pre>
                <Code>{JSON.stringify(preview.extractedValue, null, 2)}</Code>
              </pre>
            </Box>

            {preview.requestsReplaced.length > 0 && (
              <>
                <Heading size="2" m="2">
                  Value replaced in
                </Heading>
                <WebLogView
                  requests={requestsReplacedToProxyData(
                    preview.requestsReplaced
                  )}
                  onSelectRequest={onSelectRequest}
                  selectedRequestId={selectedRequest?.id}
                />
              </>
            )}
          </>
        )}
      </ScrollArea>
    </Box>
  )
}

export function requestsReplacedToProxyData(
  requests: { replaced: Request }[]
): ProxyData[] {
  return requests.map(({ replaced }, i) => ({
    request: replaced,
    id: i.toString(),
  }))
}
