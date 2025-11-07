import { Box, Button, Flex, ScrollArea, Text } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useGeneratorStore } from '@/store/generator'

import { IntroductionMessage } from './IntroductionMessage'
import { SuggestedRules } from './SuggestedRules'
import { ValidationResults } from './ValidationResults'
import { CorrelationStatus } from './types'
import { useGenerateRules } from './useGenerateRules'

interface AutoCorrelationDialogProps {
  close: () => void
  onCorrelationStatusChange: (status: CorrelationStatus) => void
}

export function AutoCorrelation({
  close,
  onCorrelationStatusChange,
}: AutoCorrelationDialogProps) {
  const rules = useGeneratorStore((state) => state.rules)
  const saveRules = useGeneratorStore((state) => state.setRules)
  const [checkedRuleIds, setCheckedRuleIds] = useState<string[]>([])

  const { proxyData: validationRequests, resetProxyData: clearValidation } =
    useListenProxyData()

  const {
    start,
    suggestedRules,
    isLoading,
    correlationStatus,
    outcomeReason,
    stop,
  } = useGenerateRules({
    clearValidation: clearValidation,
  })

  // Abort streaming on unmount
  useEffect(() => {
    return () => {
      window.studio.script.stopScript()
      void stop()
    }
  }, [stop])

  useEffect(() => {
    onCorrelationStatusChange(correlationStatus)
  }, [correlationStatus, onCorrelationStatusChange])

  useEffect(() => {
    // Suggested rules checked by default
    setCheckedRuleIds(suggestedRules.map((rule) => rule.id))
  }, [suggestedRules, setCheckedRuleIds])

  const handleAccept = () => {
    const checkedRules = suggestedRules.filter((rule) =>
      checkedRuleIds.includes(rule.id)
    )
    saveRules([...rules, ...checkedRules])
    close()
  }

  const handleDiscard = () => {
    close()
  }

  if (correlationStatus === 'not-started') {
    return <IntroductionMessage onStart={start} />
  }

  const showRuleControls = suggestedRules.length > 0 && !isLoading

  return (
    <Flex
      css={{
        height: '100%',
        borderTop: '1px solid var(--gray-5)',
      }}
    >
      <Box css={{ width: '50%', borderRight: '1px solid var(--gray-5)' }}>
        <Flex direction="column" height="100%">
          <Box css={{ flex: 1 }}>
            <Flex direction="column" height="100%">
              <ScrollArea css={{ flex: 1 }}>
                <SuggestedRules
                  suggestedRules={suggestedRules}
                  isLoading={isLoading}
                  onCheckRules={setCheckedRuleIds}
                  checkedRuleIds={checkedRuleIds}
                  correlationStatus={correlationStatus}
                />
                {outcomeReason !== '' && (
                  <Box px="3" pt="2">
                    <Text color="gray" size="2">
                      {outcomeReason}
                    </Text>
                  </Box>
                )}
              </ScrollArea>

              {showRuleControls && (
                <Flex
                  gap="3"
                  justify="end"
                  p="3"
                  css={{
                    borderTop: '1px solid var(--gray-5)',
                  }}
                >
                  <Button
                    variant="outline"
                    onClick={handleDiscard}
                    disabled={isLoading}
                    size="2"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={handleAccept}
                    disabled={isLoading || checkedRuleIds.length === 0}
                    size="2"
                  >
                    Accept ({checkedRuleIds.length})
                  </Button>
                </Flex>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>
      <Flex css={{ flex: 1 }}>
        <ValidationResults requests={validationRequests} />
      </Flex>
    </Flex>
  )
}
