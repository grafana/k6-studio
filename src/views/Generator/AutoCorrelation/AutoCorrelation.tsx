import { Box, Flex } from '@radix-ui/themes'
import { ReactNode, useEffect, useRef } from 'react'

import { ActionsLog } from '@/components/Assistant/ActionsLog'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'

import { ErrorMessage } from './ErrorMessage'
import { FooterActions } from './FooterActions'
import { IntroductionMessage } from './IntroductionMessage'
import { RulesCreated } from './RulesCreated'
import { ActionLogEntry, CorrelationStatus, SuggestedRuleEntry } from './types'
import { useGenerateRules } from './useGenerateRules'

export interface AutoCorrelationFooterContext {
  isLoading: boolean
  ruleEntries: SuggestedRuleEntry[]
  logEntries: ActionLogEntry[]
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
  /** Shows the actions log full-width without the rules pane. */
  hideRules?: boolean
  /** Called once when the analysis finishes (not on stop/abort). */
  onSettled?: (context: AutoCorrelationFooterContext) => void
}

const SETTLED_STATUSES: CorrelationStatus[] = [
  'success',
  'partial-success',
  'failure',
  'correlation-not-needed',
]

export function AutoCorrelation({
  close,
  skipIntroduction = false,
  onStatusChange,
  footer,
  hideRules = false,
  onSettled,
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

  const hasSettled = useRef(false)

  useEffect(() => {
    if (!SETTLED_STATUSES.includes(correlationStatus)) {
      hasSettled.current = false
      return
    }

    if (hasSettled.current) {
      return
    }

    hasSettled.current = true
    onSettled?.({
      isLoading,
      ruleEntries,
      logEntries: actionsLog,
      correlationStatus,
      stop,
      accept: acceptRules,
    })
    // The context callbacks are re-created on every render; the status guard
    // makes this fire once per finished run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correlationStatus])

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

  const showRules = !hideRules

  const renderFooter = () => {
    if (footer) {
      return footer({
        isLoading,
        ruleEntries,
        logEntries: actionsLog,
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
        // In a flex column parent (the wizard step) take the remaining space
        // instead of overflowing it.
        flex: '1 1 0%',
        minHeight: 0,
        borderTop: '1px solid var(--gray-5)',
      }}
      direction="column"
    >
      <Flex css={{ flex: 1, minHeight: 0 }}>
        <Box
          css={{
            width: showRules ? '60%' : '100%',
            borderRight: showRules ? '1px solid var(--gray-5)' : 'none',
          }}
        >
          <ActionsLog entries={actionsLog} />
        </Box>
        {showRules && (
          <Box css={{ width: '40%', backgroundColor: 'var(--gray-2)' }}>
            <RulesCreated
              entries={ruleEntries}
              isLoading={isLoading}
              onRemoveRule={removeRule}
            />
          </Box>
        )}
      </Flex>

      {renderFooter()}
    </Flex>
  )
}
