import { Box, Button, Flex } from '@radix-ui/themes'
import { useEffect } from 'react'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'

import { ActionsLog } from './ActionsLog'
import { ErrorMessage } from './ErrorMessage'
import { IntroductionMessage } from './IntroductionMessage'
import { RulesCreated } from './RulesCreated'
import { CorrelationStatus } from './types'
import { useGenerateRules } from './useGenerateRules'

interface AutoCorrelationProps {
  close: () => void
  onCorrelationStatusChange: (status: CorrelationStatus) => void
}

export function AutoCorrelation({
  close,
  onCorrelationStatusChange,
}: AutoCorrelationProps) {
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
      void stop()
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

  useEffect(() => {
    onCorrelationStatusChange(correlationStatus)
  }, [correlationStatus, onCorrelationStatusChange])

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

interface FooterActionsProps {
  isLoading: boolean
  ruleCount: number
  onStop: () => void
  onDiscard: () => void
  onAccept: () => void
}

function FooterActions({
  isLoading,
  ruleCount,
  onStop,
  onDiscard,
  onAccept,
}: FooterActionsProps) {
  if (isLoading) {
    return (
      <Button variant="outline" onClick={onStop} size="2" color="red">
        Stop
      </Button>
    )
  }

  return (
    <Flex gap="3">
      <Button variant="outline" onClick={onDiscard} size="2">
        Discard
      </Button>
      <Button onClick={onAccept} disabled={ruleCount === 0} size="2">
        Add {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
      </Button>
    </Flex>
  )
}
