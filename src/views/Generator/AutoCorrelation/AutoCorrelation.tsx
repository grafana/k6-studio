import { Box, Flex } from '@radix-ui/themes'
import { useEffect } from 'react'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'

import { ActionsLog } from './ActionsLog'
import { ErrorMessage } from './ErrorMessage'
import { FooterActions } from './FooterActions'
import { IntroductionMessage } from './IntroductionMessage'
import { RulesCreated } from './RulesCreated'
import { useGenerateRules } from './useGenerateRules'

interface AutoCorrelationProps {
  close: () => void
}

export function AutoCorrelation({ close }: AutoCorrelationProps) {
  const rules = useGeneratorStore((state) => state.rules)
  const saveRules = useGeneratorStore((state) => state.setRules)
  const recording = useGeneratorStore(selectFilteredRequests)

  const { proxyData: validationRequests, resetProxyData: clearValidation } =
    useListenProxyData()

  const {
    start,
    ruleEntries,
    actionsLog,
    isLoading,
    correlationStatus,
    error,
    stop,
    restart,
    reset,
    removeRule,
    updateValidationProgress,
  } = useGenerateRules({ clearValidation })

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  useEffect(() => {
    if (correlationStatus === 'validating' && validationRequests.length > 0) {
      updateValidationProgress(validationRequests.length, recording.length)
    }
  }, [
    validationRequests.length,
    correlationStatus,
    recording.length,
    updateValidationProgress,
  ])

  const handleAccept = () => {
    const acceptedRules = ruleEntries.map((entry) => entry.rule)
    saveRules([...rules, ...acceptedRules])
    close()
  }

  if (correlationStatus === 'not-started') {
    return <IntroductionMessage onStart={start} />
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={restart}
        onReset={reset}
        onClose={close}
      />
    )
  }

  return (
    <Flex
      css={{
        height: '100%',
        borderTop: '1px solid var(--gray-5)',
      }}
      direction="column"
    >
      <Flex css={{ flex: 1, minHeight: 0 }}>
        <Box css={{ width: '60%', borderRight: '1px solid var(--gray-5)' }}>
          <ActionsLog entries={actionsLog} />
        </Box>
        <Box css={{ width: '40%', backgroundColor: 'var(--gray-2)' }}>
          <RulesCreated
            entries={ruleEntries}
            isLoading={isLoading}
            onRemoveRule={removeRule}
          />
        </Box>
      </Flex>

      <Flex
        gap="3"
        justify="end"
        align="center"
        p="3"
        css={{ borderTop: '1px solid var(--gray-5)' }}
      >
        <FooterActions
          isLoading={isLoading}
          ruleCount={ruleEntries.length}
          onStop={stop}
          onDiscard={close}
          onAccept={handleAccept}
        />
      </Flex>
    </Flex>
  )
}
