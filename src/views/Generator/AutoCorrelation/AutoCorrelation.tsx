import { Box, Button, Flex, ScrollArea } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { useEffect, useState } from 'react'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useGeneratorStore } from '@/store/generator'

import { IntroductionMessage } from './IntroductionMessage'
import { StatusPanel } from './StatusPanel'
import { SuggestedRules } from './SuggestedRules'
import { ValidationResults } from './ValidationResults'
import { useGenerateRules } from './useGenerateRules'

interface AutoCorrelationDialogProps {
  close: () => void
}

export function AutoCorrelation({ close }: AutoCorrelationDialogProps) {
  const rules = useGeneratorStore((state) => state.rules)
  const saveRules = useGeneratorStore((state) => state.setRules)
  const [checkedRuleIds, setCheckedRuleIds] = useState<string[]>([])

  const { proxyData: validationRequests, resetProxyData: clearValidation } =
    useListenProxyData()

  const {
    start,
    suggestedRules,
    isValid,
    isLoading,
    correlationStatus,
    error,
    messages,
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

  return (
    <Allotment defaultSizes={[1, 1]}>
      <Allotment.Pane minSize={280}>
        <Allotment vertical defaultSizes={[1, 1]}>
          <Allotment.Pane minSize={100}>
            <StatusPanel
              correlationStatus={correlationStatus}
              isSuccess={isValid}
              error={error ? 'Something went wrong' : undefined}
              isLoading={isLoading}
              outcomeReason={outcomeReason}
            />
            <Box>
              {messages
                .filter((m) => m.role === 'assistant')
                .map((message) => (
                  <div key={message.id}>
                    {message.parts.map((part, index) =>
                      part.type === 'text' ? (
                        <span key={index}>{part.text}</span>
                      ) : null
                    )}
                  </div>
                ))}
            </Box>
          </Allotment.Pane>
          <Allotment.Pane>
            <Flex direction="column" height="100%">
              <ScrollArea style={{ flex: 1 }}>
                <SuggestedRules
                  suggestedRules={suggestedRules}
                  isLoading={isLoading}
                  setCheckedRuleIds={setCheckedRuleIds}
                  checkedRuleIds={checkedRuleIds}
                />
              </ScrollArea>

              {suggestedRules.length > 0 && (
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
          </Allotment.Pane>
        </Allotment>
      </Allotment.Pane>
      <Allotment.Pane minSize={280}>
        <ValidationResults requests={validationRequests} isSuccess={isValid} />
      </Allotment.Pane>
    </Allotment>
  )
}
