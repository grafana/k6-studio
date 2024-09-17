import { Box, Callout, Code, Flex, Heading, ScrollArea } from '@radix-ui/themes'
import { TestRule, CorrelationRule, CorrelationStateMap } from '@/types/rules'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { applyRule } from '@/rules/rules'
import { ProxyData, RequestSnippetSchema, Request } from '@/types'
import { generateSequentialInt } from '@/rules/utils'
import { useMemo, useState } from 'react'
import { WebLogView } from '@/components/WebLogView'
import { Allotment } from 'allotment'
import { Details } from '@/components/WebLogView/Details'
import { css } from '@emotion/react'

export function CorrelationPreview({ rule }: { rule: CorrelationRule }) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const requests = useGeneratorStore(selectFilteredRequests)
  const rules = useGeneratorStore((state) => state.rules)

  const result = useMemo(
    () => applyRules(rules, requests, rule.id),
    [rules, requests, rule]
  )

  if (!result) {
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
        <Flex height="100%">
          <ScrollArea scrollbars="vertical">
            <Box
              css={css`
                flex-grow: 1;
              `}
            >
              {result && (
                <>
                  <Heading size="2" m="2">
                    Requests matched
                  </Heading>
                  <Box>
                    <WebLogView
                      requests={result.responsesExtracted}
                      onSelectRequest={setSelectedRequest}
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
                        onSelectRequest={console.log}
                      />
                    </>
                  )}
                </>
              )}
            </Box>
          </ScrollArea>
        </Flex>
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

function applyRules(
  rules: TestRule[],
  requests: ProxyData[],
  selectedRuleId: string
) {
  const sequentialIdGenerator = generateSequentialInt()
  const correlationStateMap: CorrelationStateMap = {}

  requests.forEach((request) => {
    rules.forEach((rule) => {
      const snippetSchema: RequestSnippetSchema = {
        data: request,
        before: [],
        after: [],
      }

      applyRule(snippetSchema, rule, correlationStateMap, sequentialIdGenerator)
    })
  })

  // Only interested in the selected rule
  return correlationStateMap[selectedRuleId]
}

function requestsReplacedToProxyData(
  requests: [Request, Request][]
): ProxyData[] {
  console.log('request', requests)
  return requests.map(([, modified], i) => ({
    request: modified,
    id: i.toString(),
  }))
}
