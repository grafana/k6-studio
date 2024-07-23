import { Box, Callout, Code, Heading } from '@radix-ui/themes'
import { TestRule, CorrelationRule, CorrelationStateMap } from '@/types/rules'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import { applyRule } from '@/rules/rules'
import { ProxyData, RequestSnippetSchema, Request } from '@/types'
import { generateSequentialInt } from '@/rules/utils'
import { useMemo } from 'react'
import { WebLogView } from '@/components/WebLogView'

export function CorrelationPreview({ rule }: { rule: CorrelationRule }) {
  const requests = useGeneratorStore(selectFilteredRequests)
  const rules = useGeneratorStore((state) => state.rules)

  const result = useMemo(
    () => applyRules(rules, requests, rule.id),
    [rules, requests, rule]
  )

  return (
    <>
      <Heading size="3" mb="3">
        Preview
      </Heading>
      {!result && (
        <Callout.Root color="amber" role="alert" variant="surface">
          <Callout.Text wrap="balance">No requests matched</Callout.Text>
        </Callout.Root>
      )}
      <Box>
        {result && (
          <>
            <Heading size="2" mb="2">
              Requests matched
            </Heading>
            <WebLogView requests={result.responsesExtracted} />
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
                />
              </>
            )}
          </>
        )}
      </Box>
    </>
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
