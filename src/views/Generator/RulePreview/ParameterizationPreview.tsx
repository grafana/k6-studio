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
import { createParameterizationRuleInstance } from '@/rules/parameterization'

export function ParameterizationPreview({
  rule,
}: {
  rule: ParameterizationRule
}) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const requests = useGeneratorStore(selectFilteredRequests)
  const rules = useGeneratorStore((state) => state.rules)

  const result = useMemo(() => {
    const preceedingRules = rules.slice(0, rules.indexOf(rule))
    const { requestSnippetSchemas } = applyRules(requests, preceedingRules)

    const ruleInstance = createParameterizationRuleInstance(rule)
    requestSnippetSchemas.forEach(ruleInstance.apply)

    return ruleInstance.state
  }, [rules, requests, rule])

  if (result.requestsReplaced.length === 0) {
    return (
      <Box p="2">
        <Callout.Root color="amber" role="alert" variant="surface">
          <Callout.Text wrap="balance">No requests matched</Callout.Text>
        </Callout.Root>
      </Box>
    )
  }

  return (
    <Allotment defaultSizes={[1, 2]} vertical>
      <Allotment.Pane minSize={200}>
        <Box height="100%">
          <ScrollArea scrollbars="vertical" css={{ height: '100%' }}>
            {result.requestsReplaced.length > 0 && (
              <>
                <Heading size="2" m="2">
                  Requests matched
                </Heading>
                <WebLogView
                  requests={requestsReplacedToProxyData(
                    result.requestsReplaced
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
