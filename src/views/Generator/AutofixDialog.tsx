import { css } from '@emotion/react'
import { Box, Button, Dialog, Flex, Heading, Spinner } from '@radix-ui/themes'
import { useMutation, useQuery } from '@tanstack/react-query'
import { produce } from 'immer'

import { removeWebsocketRequests } from '@/codegen/codegen.utils'
import { CorrelationRuleSchema } from '@/schemas/generator'
import { useGeneratorStore } from '@/store/generator'
import { ProxyData } from '@/types'
import { TestRule } from '@/types/rules'
import { safeAtob } from '@/utils/format'

import { SortableRuleList } from './TestRuleContainer/SortableRuleList'
import { TestRuleInlineContent } from './TestRuleContainer/TestRule/TestRuleInlineContent'
import { TestRuleTypeBadge } from './TestRuleContainer/TestRule/TestRuleTypeBadge'

interface AutofixProps {
  onOpenChange: (open: boolean) => void
  originalRequests: ProxyData[]
  validationRequests: ProxyData[]
  handleRunScript: () => void
  sessionID: string
}

export function AutofixDialog({
  onOpenChange,
  originalRequests,
  validationRequests,
  handleRunScript,
  sessionID,
}: AutofixProps) {
  console.log('AutofixDialog', originalRequests, validationRequests)
  const rez = useFetchAutofix(
    cleanUpRequests(originalRequests),
    cleanUpRequests(validationRequests),
    sessionID
  )
  const setRules = useGeneratorStore((state) => state.setRules)

  function handleApply() {
    if (!rez.data) {
      return
    }
    setRules(rez.data)
    onOpenChange(false)
  }
  return (
    <Box p="3">
      <Box mb="2">
        <Heading size="4" mb="3">
          Analyze recording and generate rules automatically
        </Heading>
        <Button onClick={rez.mutate} disabled={rez.isPending}>
          Start
        </Button>
      </Box>

      {rez.isPending && (
        <Box>
          <Heading size="2" mb="3">
            <Flex gap="2">
              <Spinner /> Doing magic..
            </Flex>
          </Heading>
        </Box>
      )}

      {rez.data && (
        <Box>
          <Heading size="4" mb="3">
            Generated rules:
          </Heading>
          <RuleList rules={rez.data} />
          <Button my="3" onClick={handleApply}>
            Apply and validate
          </Button>
        </Box>
      )}
    </Box>
  )
}

function RuleList({ rules }: { rules: TestRule[] }) {
  return (
    <Box>
      {rules.map((rule) => (
        <Flex
          key={rule.id}
          p="2"
          gap="2"
          align="center"
          css={css`
            position: relative;
            border-bottom: 1px solid var(--gray-3);
          `}
        >
          <TestRuleTypeBadge rule={rule} />

          <Flex gap="2" overflow="hidden">
            <TestRuleInlineContent rule={rule} />
          </Flex>
        </Flex>
      ))}
    </Box>
  )
}

function cleanUpRequests(requests: ProxyData[]) {
  return removeWebsocketRequests(
    requests
      .filter((req) => req.request.method !== 'OPTIONS')
      // .filter((req) => req.response && req.response?.statusCode >= 399)
      .map((request) => {
        return produce(request, (draft) => {
          delete draft.clientConn
          delete draft.serverConn
          delete draft.intercepted
          delete draft.isReplay
          delete draft.type
          delete draft.modified
          delete draft.marked
          delete draft.comment
          if (draft.response) {
            const decodedContent = safeAtob(draft.response.content)
            const contentType = draft.response.headers.find(
              ([key]) => key.toLowerCase() === 'content-type'
            )?.[1]

            const isHtml = contentType?.includes('text/html')
            // draft.response.content = isHtml
            // ? extractTextFromHTML(decodedContent)
            // : decodedContent
            draft.response.content = decodedContent

            draft.response.headers = draft.response.headers.filter(([key]) =>
              key.toLowerCase().includes('cookie')
            )
          }

          draft.request.headers = draft.request.headers.filter(
            ([key]) => !key.toLowerCase().includes('sec-')
          )
        })
      })
  )
}

function useFetchAutofix(recording, validation, sessionID) {
  return useMutation({
    mutationFn: async () => {
      const request = await fetch('http://localhost:3001', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recording,
          validation,
          sessionID,
        }),
      })
      const json = await request.json()
      const rez = CorrelationRuleSchema.array().parse(json)

      return rez
    },

    // queryKey: ['autofix'],
  })
}
function extractTextFromHTML(htmlString: string) {
  // Create a DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')

  // Remove script, style, and noscript elements
  const elementsToRemove = doc.querySelectorAll(
    'script, style, noscript, iframe, svg, canvas, img, video, audio'
  )
  elementsToRemove.forEach((el) => el.remove())

  // Optionally remove hidden elements (CSS display: none or visibility: hidden)
  const hiddenElements = doc.querySelectorAll(
    '[style*="display:none"], [style*="visibility:hidden"]'
  )
  hiddenElements.forEach((el) => el.remove())

  // Get visible text content
  const textContent = doc.body.textContent || ''

  // Normalize whitespace
  return textContent.replace(/\s+/g, ' ').trim()
}
