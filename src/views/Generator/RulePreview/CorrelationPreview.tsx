import { Box, Callout, Code, Heading, ScrollArea } from '@radix-ui/themes'
import { CorrelationRule } from '@/types/rules'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { ProxyData, Request } from '@/types'
import { useMemo, useState } from 'react'
import { WebLogView } from '@/components/WebLogView'
import { Allotment } from 'allotment'
import { Details } from '@/components/WebLogView/Details'
import { css } from '@emotion/react'
import { applyRules } from '@/rules/rules'
import { createCorrelationRuleInstance } from '@/rules/correlation'

export function CorrelationPreview({ rule }: { rule: CorrelationRule }) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const requests = useGeneratorStore(selectFilteredRequests)
  const rules = useGeneratorStore((state) => state.rules)

  const result = useMemo(() => {
    const preceedingRules = rules.slice(0, rules.indexOf(rule))
    const { requestSnippetSchemas } = applyRules(requests, preceedingRules)

    const ruleInstance = createCorrelationRuleInstance(rule)
    requestSnippetSchemas.forEach(ruleInstance.apply)

    return ruleInstance.state
  }, [rules, requests, rule])

  if (!result.extractedValue) {
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
          <ScrollArea
            scrollbars="vertical"
            css={css`
              height: 100%;
            `}
          >
            {result.extractedValue && (
              <>
                <Heading size="2" m="2">
                  Requests matched
                </Heading>
                <Box>
                  <WebLogView
                    requests={result.responsesExtracted}
                    onSelectRequest={setSelectedRequest}
                    selectedRequestId={selectedRequest?.id}
                  />
                </Box>
                <Heading size="2" m="2">
                  Extracted value:{' '}
                </Heading>
                <Box px="2">
                  <pre>
                    <Code>
                      {JSON.stringify(result.extractedValue, null, 2)}
                    </Code>
                  </pre>
                </Box>

                {result.requestsReplaced.length > 0 && (
                  <>
                    <Heading size="2" m="2">
                      Value replaced in
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

export function requestsReplacedToProxyData(
  requests: { replaced: Request }[]
): ProxyData[] {
  console.log('request', requests)
  return requests.map(({ replaced }, i) => ({
    request: replaced,
    id: i.toString(),
  }))
}
