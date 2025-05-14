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
}

export function AutofixDialog({
  onOpenChange,
  originalRequests,
  validationRequests,
  handleRunScript,
}: AutofixProps) {
  console.log('AutofixDialog', originalRequests, validationRequests)
  const rez = useFetchAutofix(
    cleanUpRequests(originalRequests),
    cleanUpRequests(validationRequests)
  )
  const setRules = useGeneratorStore((state) => state.setRules)

  function handleApply() {
    setRules(rez.data)
    onOpenChange(false)
  }
  console.log('rez', rez)
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
    requests.map((request) => {
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
          draft.response.content = safeAtob(draft.response.content)
        }
      })
    })
  )
}

function useFetchAutofix(recording, validation) {
  console.log('useFetchAutofix', recording, validation)
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
        }),
      })
      const json = await request.json()
      const rez = CorrelationRuleSchema.array().parse(json)

      return rez
    },

    // queryKey: ['autofix'],
  })
}
