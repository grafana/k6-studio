import { Callout, IconButton } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { WandSparklesIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate, useSearchParams } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { Group, Panel, Separator } from '@/components/primitives/ResizablePanel'
import { HttpRequestDetails } from '@/components/WebLogView/HttpRequestDetails'
import { GeneratorContent } from '@/handlers/fs/types'
import { useSaveFile } from '@/hooks/useSaveFile'
import { useScriptPreview } from '@/hooks/useScriptPreview'
import { getViewPath } from '@/routeMap'
import { useGeneratorStore, selectGeneratorData } from '@/store/generator'
import { useToast } from '@/store/ui/useToast'
import { StudioFile, ProxyData } from '@/types'
import { GeneratorFileData } from '@/types/generator'

import {
  useGeneratorLayout,
  useIsGeneratorDirty,
  useLoadHarFile,
} from './Generator.hooks'
import { GeneratorControls } from './GeneratorControls'
import { GeneratorTabs } from './GeneratorTabs'
import { SetupWizard } from './SetupWizard'
import { SetupWizardOutcome } from './SetupWizard/SetupWizard'
import { TestRuleContainer } from './TestRuleContainer'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'

function buildSetupSummary(store: {
  allowlist: string[]
  rules: Array<{ type: string }>
  thresholds: unknown[]
}): string {
  const correlationCount = store.rules.filter(
    (rule) => rule.type === 'correlation'
  ).length
  const parameterCount = store.rules.filter(
    (rule) => rule.type === 'parameterization'
  ).length

  return [
    `${store.allowlist.length} hosts`,
    `${correlationCount} correlation rules`,
    `${parameterCount} parameters`,
    `${store.thresholds.length} thresholds`,
  ].join(' · ')
}

interface GeneratorProps {
  file: StudioFile
  content: GeneratorContent
}

export function Generator({ file, content }: GeneratorProps) {
  const setGeneratorFile = useGeneratorStore((store) => store.setGeneratorFile)
  const resetGeneratorFile = useGeneratorStore(
    (store) => store.resetGeneratorFile
  )

  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const [savedData, setSavedData] = useState<GeneratorFileData>(content.data)
  const [setupSummary, setSetupSummary] = useState<string | null>(null)

  const setRecordingPath = useGeneratorStore((store) => store.setRecordingPath)
  const recordingPath = useGeneratorStore((store) => store.recordingPath)

  const setRecording = useGeneratorStore((store) => store.setRecording)
  const setRecordingError = useGeneratorStore(
    (store) => store.setRecordingError
  )

  const showToast = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const isSetupMode = searchParams.get('mode') === 'setup'

  const filePath = file.path
  const scriptPreview = useScriptPreview(filePath)

  const { mainLayout, sidebarLayout, detailsLayout } = useGeneratorLayout()

  const {
    data: recording,
    isLoading: isLoadingRecording,
    error: harError,
  } = useLoadHarFile(recordingPath)

  const saveFile = useSaveFile({
    menuItems: {
      save: true,
      saveAs: true,
    },
    location: { type: 'file', path: filePath },
    content: () => ({
      type: 'generator' as const,
      data: selectGeneratorData(useGeneratorStore.getState()),
      isExternal: false,
    }),
    filters: [{ name: 'Generator', extensions: ['k6g'] }],
    onSave: (location) => {
      if (location.path === filePath) {
        setSavedData(selectGeneratorData(useGeneratorStore.getState()))
      } else {
        navigate(getViewPath(location.path), { replace: true })
      }
    },
    onError: (error) => {
      showToast({
        title: 'Failed to save generator',
        status: 'error',
        description: error.message,
      })

      log.error(error)
    },
  })

  const isLoading = isLoadingRecording

  const isDirty = useIsGeneratorDirty(savedData)
  const isDirtyRef = useRef(isDirty)

  const [isAppClosing, setIsAppClosing] = useState(false)

  const blocker = useBlocker(({ historyAction }) => {
    // Don't block navigation when redirecting home from invalid generator
    // TODO(router): Action enum is not exported from react-router-dom
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return isDirty && historyAction !== 'REPLACE'
  })

  useEffect(() => {
    return () => {
      resetGeneratorFile()
    }
  }, [resetGeneratorFile])

  useEffect(() => {
    setGeneratorFile(content.data)
  }, [content.data, setGeneratorFile])

  useEffect(() => {
    if (recording !== undefined) {
      setRecording(recording)
    }

    setRecordingError(harError)
  }, [harError, recording, setRecording, setRecordingError])

  useEffect(() => {
    if (harError) {
      showToast({
        title: 'Failed to load recording',
        status: 'error',
        description: 'Select another recording in the sidebar',
      })
      log.error(harError)
    }
  }, [harError, showToast])

  useEffect(() => {
    return window.studio.app.onApplicationClose(() => {
      if (isDirty || blocker.state === 'blocked') {
        setIsAppClosing(true)
        return
      }
      window.studio.app.closeApplication()
    })
  })

  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  const handleSaveGenerator = useCallback(() => {
    return saveFile({ saveAs: false })
  }, [saveFile])

  const handleChangeRecording = (newPath: string) => {
    setSelectedRequest(null)
    setRecordingPath(newPath)
  }

  const handleSaveGeneratorDialog = async () => {
    const location = await handleSaveGenerator()

    if (location === undefined) {
      setIsAppClosing(false)

      return
    }

    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }

    blocker.proceed?.()
  }

  const handleDiscardGeneratorDialog = () => {
    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }

    blocker.proceed?.()
  }

  const handleCancelGeneratorDialog = () => {
    if (isAppClosing) {
      return window.studio.app.closeApplication()
    }

    blocker.reset?.()
  }

  // `replace` keeps the dirty blocker from firing on wizard-internal
  // navigation (it only blocks non-REPLACE history actions).
  const handleExitSetupMode = (outcome: SetupWizardOutcome) => {
    if (outcome === 'completed') {
      setSetupSummary(buildSetupSummary(useGeneratorStore.getState()))
    }

    setSearchParams({}, { replace: true })
  }

  const unsavedChangesDialog = (
    <UnsavedChangesDialog
      open={blocker.state === 'blocked' || (isAppClosing && isDirty)}
      onSave={handleSaveGeneratorDialog}
      onDiscard={handleDiscardGeneratorDialog}
      onCancel={handleCancelGeneratorDialog}
    />
  )

  if (isSetupMode) {
    return (
      <>
        <SetupWizard isLoading={isLoading} onExit={handleExitSetupMode} />
        {unsavedChangesDialog}
      </>
    )
  }

  return (
    <View
      title="Generator"
      subTitle={
        <FileNameHeader
          file={file}
          isDirty={isDirty}
          canRename={!content.isExternal}
        />
      }
      actions={
        <GeneratorControls
          file={file}
          onSave={handleSaveGenerator}
          isDirty={isDirty}
          script={scriptPreview}
        />
      }
      loading={isLoading}
    >
      {setupSummary !== null && (
        <Callout.Root color="green" m="2" role="status">
          <Callout.Icon>
            <WandSparklesIcon size={16} />
          </Callout.Icon>
          <Callout.Text>Configured with Assistant: {setupSummary}</Callout.Text>
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            aria-label="Dismiss"
            onClick={() => setSetupSummary(null)}
          >
            <XIcon size={14} />
          </IconButton>
        </Callout.Root>
      )}
      <Group {...sidebarLayout}>
        <Panel id="main" minSize={580}>
          <Group orientation="vertical" {...mainLayout}>
            <Panel id="preview" minSize={200}>
              <GeneratorTabs
                script={scriptPreview}
                selectedRequest={selectedRequest}
                onSelectRequest={setSelectedRequest}
                onChangeRecording={handleChangeRecording}
              />
            </Panel>
            <Separator />
            <Panel id="rules" minSize={200}>
              <TestRuleContainer />
            </Panel>
          </Group>
        </Panel>
        {selectedRequest && (
          <>
            <Separator />
            <Panel id="request-details" defaultSize="40%" minSize={300}>
              <HttpRequestDetails
                layout={detailsLayout}
                selectedRequest={selectedRequest}
                onSelectRequest={setSelectedRequest}
              />
            </Panel>
          </>
        )}
      </Group>
      {unsavedChangesDialog}
    </View>
  )
}
