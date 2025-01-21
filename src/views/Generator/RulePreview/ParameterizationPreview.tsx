import { WebLogView } from '@/components/WebLogView'
import { applyRules } from '@/rules/rules'
import { useGeneratorStore, selectFilteredRequests } from '@/store/generator'
import { ProxyData } from '@/types'
import { ParameterizationRule } from '@/types/rules'
import { Box, Callout, Heading, ScrollArea } from '@radix-ui/themes'
import { useMemo, useState } from 'react'
import { requestsReplacedToProxyData } from './CorrelationPreview'
import { Details } from '@/components/WebLogView/Details'
import { Allotment } from 'allotment'

export function ParameterizationPreview({
  rule,
}: {
  rule: ParameterizationRule
}) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const requests = useGeneratorStore(selectFilteredRequests)
  const rules = useGeneratorStore((state) => state.rules)

  const preview = useMemo(() => {
    const preceedingAndSelectedRule = rules.slice(0, rules.indexOf(rule) + 1)
    const { ruleInstances } = applyRules(requests, preceedingAndSelectedRule)

    const selectedRuleInstance = ruleInstances.find(
      (ruleInstance) => ruleInstance.rule.id === rule.id
    )

    if (
      !selectedRuleInstance ||
      selectedRuleInstance.type !== 'parameterization'
    ) {
      return null
    }

    return selectedRuleInstance.state
  }, [rules, requests, rule])

  if (preview?.requestsReplaced.length === 0) {
    return (
      <Box p="2">
        <Callout.Root color="amber" role="alert" variant="surface">
          <Callout.Text wrap="balance">No requests matched</Callout.Text>
        </Callout.Root>
      </Box>
    )
  }

  return (
    <Allotment defaultSizes={[1, 1]}>
      <Allotment.Pane minSize={200}>
        <Box height="100%">
          <ScrollArea scrollbars="vertical" css={{ height: '100%' }}>
            {preview && preview.requestsReplaced.length > 0 && (
              <>
                <Heading size="2" m="2">
                  Requests replaced
                </Heading>
                <WebLogView
                  requests={requestsReplacedToProxyData(
                    preview.requestsReplaced
                  )}
                  onSelectRequest={setSelectedRequest}
                  selectedRequestId={selectedRequest?.id}
                />
              </>
            )}
          </ScrollArea>
        </Box>
      </Allotment.Pane>
      <Allotment.Pane minSize={300} visible={selectedRequest !== null}>
        <Details
          selectedRequest={selectedRequest}
          onSelectRequest={setSelectedRequest}
        />
      </Allotment.Pane>
    </Allotment>
  )
}
