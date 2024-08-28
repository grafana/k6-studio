import { Box, Callout, Code, Heading, ScrollArea } from '@radix-ui/themes'
import { TestRule, CorrelationRule, CorrelationStateMap } from '@/types/rules'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { applyRule } from '@/rules/rules'
import { ProxyData, RequestSnippetSchema, Request } from '@/types'
import { generateSequentialInt } from '@/rules/utils'
import { useMemo, useState } from 'react'
import { WebLogView } from '@/components/WebLogView'
import { Allotment } from 'allotment'
import { Details } from '@/components/WebLogView/Details'

export function CorrelationPreview({ rule }: { rule: CorrelationRule }) {
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const requests = useGeneratorStore(selectFilteredRequests)
  const rules = useGeneratorStore((state) => state.rules)

  const result = useMemo(
    () => applyRules(rules, requests, rule.id),
    [rules, requests, rule]
  )

  console.log({ requests, rule, rules, result })

  return (
    <Allotment defaultSizes={[1, 2]} vertical>
      <Allotment.Pane minSize={200}>
        <Heading size="3" mb="3">
          Preview
        </Heading>
        {!result && (
          <Callout.Root color="amber" role="alert" variant="surface">
            <Callout.Text wrap="balance">No requests matched</Callout.Text>
          </Callout.Root>
        )}
        <ScrollArea>
          <Box height="100%">
            {result && (
              <>
                <Heading size="2" mb="2">
                  Requests matched
                </Heading>
                <WebLogView
                  requests={result.responsesExtracted}
                  onSelectRequest={setSelectedRequest}
                />
                <Heading size="2" my="2">
                  Extracted value:{' '}
                </Heading>
                <pre>
                  <Code>{JSON.stringify(result.extractedValue, null, 2)}</Code>
                </pre>

                {result.requestsReplaced.length > 0 && (
                  <>
                    <Heading size="2" my="2">
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

  rules.forEach((rule) => {
    let uniqueId: number | undefined

    const createUniqueId = () => {
      if (uniqueId) {
        return uniqueId
      }

      uniqueId = sequentialIdGenerator.next().value
      return uniqueId
    }

    requests.forEach((request) => {
      const snippetSchema: RequestSnippetSchema = {
        data: request,
        before: [],
        after: [],
      }

      applyRule(
        snippetSchema,
        rule,
        correlationStateMap,
        createUniqueId,
        uniqueId
      )
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
