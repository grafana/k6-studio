import { Badge, Box, Button, Flex, Text } from '@radix-ui/themes'
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloudIcon,
  GaugeIcon,
  GlobeIcon,
  RocketIcon,
  TrendingUpIcon,
} from 'lucide-react'
import { PropsWithChildren, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { RunInCloudDialog } from '@/components/RunInCloudDialog/RunInCloudDialog'
import { LoadProfile } from '@/components/TestOptions'
import { FileLocation } from '@/handlers/fs/types'
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { ScriptPreview } from '@/hooks/useScriptPreview'
import {
  selectFilteredRequests,
  selectLoadProfileExecutorOptions,
  useGeneratorStore,
} from '@/store/generator'
import { HTTP_METRICS_CONFIG } from '@/views/Generator/TestOptions/httpThresholdMetrics'

import { STEP_CONFIG } from '../../constants'
import { useSetupWizard } from '../../state/SetupWizardContext'
import { STEP_ORDER, StepId } from '../../state/types'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'

import { formatThresholds, getLoadSummary } from './summary'

interface RunTestStepProps {
  script: ScriptPreview
  scriptName: string
  onSave: () => Promise<FileLocation | undefined>
  onComplete: () => void
}

function CollapsibleSection({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Box
      css={{
        border: '1px solid var(--gray-4)',
        borderRadius: 'var(--radius-3)',
        overflow: 'hidden',
      }}
    >
      <Flex p="1">
        <Button
          variant="ghost"
          color="gray"
          size="1"
          m="1"
          onClick={() => setIsOpen((previous) => !previous)}
        >
          {isOpen ? (
            <ChevronDownIcon size={14} />
          ) : (
            <ChevronRightIcon size={14} />
          )}
          {label}
        </Button>
      </Flex>
      {isOpen && (
        <Box css={{ borderTop: '1px solid var(--gray-4)' }}>{children}</Box>
      )}
    </Box>
  )
}

function WhatWillRun() {
  const requestCount = useGeneratorStore(
    (store) => selectFilteredRequests(store).length
  )
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const loadProfile = useGeneratorStore(
    useShallow(selectLoadProfileExecutorOptions)
  )
  const thresholds = useGeneratorStore((store) => store.thresholds)

  const load = getLoadSummary(loadProfile)
  const thresholdsLine = formatThresholds(thresholds, HTTP_METRICS_CONFIG)

  return (
    <Flex
      direction="column"
      gap="3"
      p="4"
      css={{
        border: '1px solid var(--gray-4)',
        borderRadius: 'var(--radius-3)',
      }}
    >
      <Flex gap="2" align="start">
        <GlobeIcon size={16} css={{ flexShrink: 0, marginTop: 2 }} />
        <Flex direction="column" gap="1">
          <Text size="2" weight="medium">
            {requestCount} request{requestCount === 1 ? '' : 's'} across{' '}
            {allowlist.length} host{allowlist.length === 1 ? '' : 's'}
          </Text>
          <Flex gap="1" wrap="wrap">
            {allowlist.map((host) => (
              <Badge key={host} color="gray" variant="surface">
                {host}
              </Badge>
            ))}
          </Flex>
        </Flex>
      </Flex>
      <Flex gap="2" align="start">
        <TrendingUpIcon size={16} css={{ flexShrink: 0, marginTop: 2 }} />
        <Flex direction="column" gap="1">
          <Text size="2" weight="medium">
            {load.headline}
          </Text>
          {load.detail !== '' && (
            <Text size="1" color="gray">
              {load.detail}
            </Text>
          )}
        </Flex>
      </Flex>
      {thresholdsLine !== '' && (
        <Flex gap="2" align="start">
          <GaugeIcon size={16} css={{ flexShrink: 0, marginTop: 2 }} />
          <Text size="2" weight="medium">
            {thresholdsLine}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}

function LoadOptionsSection() {
  const loadProfile = useGeneratorStore(
    useShallow(selectLoadProfileExecutorOptions)
  )
  const setLoadProfile = useGeneratorStore((store) => store.setLoadProfile)

  return (
    <CollapsibleSection label="Edit load options">
      <Box p="4">
        <LoadProfile
          value={loadProfile}
          onChange={setLoadProfile}
          executors={['ramping-vus', 'shared-iterations']}
        />
      </Box>
    </CollapsibleSection>
  )
}

function AssistantRecap() {
  const { state } = useSetupWizard()
  const agentSteps = STEP_ORDER.slice(0, -1) as Exclude<StepId, 'runTest'>[]

  return (
    <Flex direction="column" gap="2">
      <Text
        size="1"
        color="gray"
        weight="bold"
        css={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        Configured by Assistant
      </Text>
      {agentSteps.map((stepId) => {
        const { icon: Icon, label } = STEP_CONFIG[stepId]
        const stepState = state.steps[stepId]

        return (
          <Flex key={stepId} gap="2" align="center">
            <Icon
              size={16}
              css={{ color: 'var(--orange-11)', flexShrink: 0 }}
            />
            <Text size="2" weight="medium" css={{ width: 150, flexShrink: 0 }}>
              {label}
            </Text>
            <Text size="2" color="gray">
              {stepState.status === 'completed' ? stepState.summary : '-'}
            </Text>
          </Flex>
        )
      })}
    </Flex>
  )
}

function CloudNote() {
  const authStatus = useAuthStatus()

  const destination =
    authStatus.type === 'signed-in'
      ? `Runs in Grafana Cloud (${authStatus.stack.name}).`
      : "Runs in Grafana Cloud - we'll ask you to sign in first."

  return (
    <Flex gap="2" align="center">
      <CloudIcon size={16} css={{ color: 'var(--gray-9)', flexShrink: 0 }} />
      <Text size="2" color="gray">
        {destination} Results open in your browser.
      </Text>
    </Flex>
  )
}

export function RunTestStep({
  script,
  scriptName,
  onSave,
  onComplete,
}: RunTestStepProps) {
  const { goBack } = useWizardNavigation()
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSaveAndRun = async () => {
    setIsSaving(true)

    try {
      const location = await onSave()

      if (location !== undefined) {
        setIsDialogOpen(true)
      }
    } catch {
      // useSaveFile already surfaces the error in a toast.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <StepFrame stepId="runTest">
        <Flex direction="column" gap="4">
          <WhatWillRun />
          <LoadOptionsSection />
          <AssistantRecap />
          <CollapsibleSection label="View generated script">
            <Box css={{ height: 320 }}>
              <ReadOnlyEditor
                defaultLanguage="javascript"
                value={script.valid ? script.preview : ''}
                showToolbar={false}
              />
            </Box>
          </CollapsibleSection>
          <CloudNote />
        </Flex>
      </StepFrame>
      <Flex
        flexShrink="0"
        align="center"
        gap="3"
        px="5"
        py="3"
        css={{
          borderTop: '1px solid var(--gray-4)',
          backgroundColor: 'var(--color-panel)',
        }}
      >
        <Button variant="ghost" color="gray" onClick={goBack}>
          <ArrowLeftIcon size={16} /> Back
        </Button>
        <Flex flexGrow="1" />
        <Button variant="ghost" color="gray" onClick={onComplete}>
          Go to generator
        </Button>
        <Button
          disabled={!script.valid || isSaving || isDialogOpen}
          onClick={handleSaveAndRun}
        >
          Save & Run <RocketIcon size={16} />
        </Button>
      </Flex>
      {script.valid && (
        <RunInCloudDialog
          open={isDialogOpen}
          script={{ type: 'raw', name: scriptName, content: script.preview }}
          onOpenChange={setIsDialogOpen}
          onRunStarted={onComplete}
        />
      )}
    </>
  )
}
