import { Box, Flex } from '@radix-ui/themes'
import { ReactNode, useEffect, useRef } from 'react'

import { ActionsLog } from '@/components/Assistant/ActionsLog'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'

import { ErrorMessage } from './ErrorMessage'
import { FooterActions } from './FooterActions'
import { IntroductionMessage } from './IntroductionMessage'
import { RulesCreated } from './RulesCreated'
import { CorrelationStatus, SuggestedRuleEntry } from './types'
import { useGenerateRules } from './useGenerateRules'

export interface AutoCorrelationFooterContext {
  isLoading: boolean
  ruleEntries: SuggestedRuleEntry[]
  correlationStatus: CorrelationStatus
  stop: () => void
  accept: () => void
}

interface AutoCorrelationProps {
  close: () => void
  /** Start analysis immediately instead of showing the introduction screen. */
  skipIntroduction?: boolean
  onStatusChange?: (status: CorrelationStatus) => void
  /** Replaces the default Stop/Discard/Accept footer. */
  footer?: (context: AutoCorrelationFooterContext) => ReactNode
}

export function AutoCorrelation({
  close,
  skipIntroduction = false,
  onStatusChange,
  footer,
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

  const hasAutoStarted = useRef(false)

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  useEffect(() => {
    onStatusChange?.(correlationStatus)
  }, [correlationStatus, onStatusChange])

  useEffect(() => {
    if (!skipIntroduction || hasAutoStarted.current) {
      return
    }

    hasAutoStarted.current = true
    void start()
    // start is re-created on every render; the ref guard makes this run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipIntroduction])

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

  const acceptRules = () => {
    const acceptedRules = ruleEntries.map((entry) => entry.rule)
    saveRules([...rules, ...acceptedRules])
  }

  const handleAccept = () => {
    acceptRules()
    close()
  }

  if (correlationStatus === 'not-started' && !skipIntroduction) {
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

  const renderFooter = () => {
    if (footer) {
      return footer({
        isLoading,
        ruleEntries,
        correlationStatus,
        stop,
        accept: acceptRules,
      })
    }

    return (
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

      {renderFooter()}
    </Flex>
  )
}
