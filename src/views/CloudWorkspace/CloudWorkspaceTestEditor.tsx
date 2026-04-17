import { css } from '@emotion/react'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Spinner,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { CircleCheckBigIcon, SaveIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { ReactMonacoEditor } from '@/components/Monaco/ReactMonacoEditor'
import TextSpinner from '@/components/TextSpinner/TextSpinner'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import type { Script } from '@/handlers/cloud/types'
import {
  type CloudTestRefString,
  parseCloudTestRef,
} from '@/handlers/cloudWorkspace/types'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

import { Debugger } from '../Validator/Debugger'
import { useDebugSession } from '../Validator/Validator.hooks'

import { useInspectScriptOptions } from './useInspectScriptOptions'

export function CloudWorkspaceTestEditor() {
  const { ref: refParam } = useParams<{ ref: string }>()
  const ref = refParam ? decodeURIComponent(refParam) : ''

  return <CloudWorkspaceTestEditorInner key={ref} urlRef={ref} />
}

function CloudWorkspaceTestEditorInner({ urlRef }: { urlRef: string }) {
  const ref = urlRef
  const parsed = parseCloudTestRef(ref)

  const [source, setSource] = useState('')
  const [savedSource, setSavedSource] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'saving' | 'running'
  >('idle')
  const isDirty = source !== savedSource

  const script: Script = useMemo(
    () => ({
      type: 'raw',
      content: source,
      name: ref || 'cloud-test',
    }),
    [ref, source]
  )

  const { session, startDebugging, stopDebugging } = useDebugSession(script)
  const { options, optionsReady } = useInspectScriptOptions(source, ref)
  const proxyStatus = useProxyStatus()
  const showToast = useToast()

  const isRunning = session.state === 'running'

  const cloudFile: StudioFile = useMemo(
    () => ({
      type: 'script',
      fileName: `cloud-workspace/${ref}`,
      displayName: ref,
    }),
    [ref]
  )

  useEffect(() => {
    if (parsed?.testId === undefined || parsed?.projectId === undefined) {
      setLoadError('Invalid test link.')

      return
    }

    let cancelled = false

    setStatus('loading')
    setLoadError(null)

    window.studio.cloudWorkspace
      .getScript(ref as CloudTestRefString)
      .then((text) => {
        if (cancelled) return
        setSource(text)
        setSavedSource(text)
        setStatus('idle')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load script.'
        )
        setStatus('idle')
      })

    return () => {
      cancelled = true
    }
  }, [parsed?.testId, parsed?.projectId, ref])

  useEffect(() => {
    return window.studio.script.onScriptFinished(() => {
      showToast({
        title: 'Script execution finished',
        status: 'success',
      })
    })
  }, [showToast])

  useEffect(() => {
    return window.studio.script.onScriptFailed(() => {
      showToast({
        title: 'Script execution finished',
        description: 'The script finished running with errors',
        status: 'error',
      })
    })
  }, [showToast])

  const handleSave = useCallback(async () => {
    if (parsed === null) return

    setStatus('saving')
    try {
      await window.studio.cloudWorkspace.saveScript(
        ref as CloudTestRefString,
        source
      )
      setSavedSource(source)
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to save script.'
      )
    } finally {
      setStatus('idle')
    }
  }, [parsed, ref, source])

  const handleRunInCloud = useCallback(async () => {
    if (parsed === null) return

    if (isDirty) {
      await handleSave()
    }

    setStatus('running')
    try {
      await window.studio.cloudWorkspace.runTest(ref as CloudTestRefString)
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to start test run.'
      )
    } finally {
      setStatus('idle')
    }
  }, [handleSave, isDirty, parsed, ref])

  const handleValidate = useCallback(async () => {
    await startDebugging()
  }, [startDebugging])

  const handleStop = useCallback(async () => {
    await stopDebugging()

    showToast({
      title: 'Script execution stopped',
      description: 'The script execution was stopped by the user',
    })
  }, [showToast, stopDebugging])

  if (parsed === null) {
    return (
      <Box p="6">
        <Text color="red">{loadError ?? 'Invalid test reference.'}</Text>
      </Box>
    )
  }

  if (status === 'loading') {
    return (
      <Flex align="center" justify="center" height="100%">
        <Spinner />
      </Flex>
    )
  }

  if (loadError && savedSource === '' && source === '') {
    return (
      <Box p="6">
        <Text color="red">{loadError}</Text>
      </Box>
    )
  }

  return (
    <View
      title="Cloud test"
      subTitle={
        <FileNameHeader file={cloudFile} canRename={false} isDirty={isDirty} />
      }
      actions={
        <Flex align="center" gap="2" ml="2">
          <Flex gap="4" align="center">
            {isRunning && (
              <>
                <TextSpinner text="Running" />
                <Button variant="outline" onClick={() => void handleStop()}>
                  Stop run
                </Button>
              </>
            )}
            {!isRunning && (
              <>
                <Tooltip content={isDirty ? 'Save changes' : 'Changes saved'}>
                  <IconButton
                    onClick={() => void handleSave()}
                    disabled={status !== 'idle' || !isDirty}
                    variant="ghost"
                    color="gray"
                  >
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  content={`Proxy is ${proxyStatus}`}
                  hidden={proxyStatus === 'online'}
                >
                  <Button
                    variant="ghost"
                    onClick={() => void handleValidate()}
                    disabled={proxyStatus !== 'online' || status !== 'idle'}
                  >
                    <CircleCheckBigIcon /> Validate
                  </Button>
                </Tooltip>
                <Button
                  disabled={status !== 'idle'}
                  loading={status === 'running'}
                  onClick={() => void handleRunInCloud()}
                >
                  <GrafanaIcon /> Run in Grafana Cloud
                </Button>
              </>
            )}
            {loadError && (
              <Text
                size="1"
                color="red"
                css={css`
                  max-width: 200px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                `}
              >
                {loadError}
              </Text>
            )}
          </Flex>
        </Flex>
      }
    >
      <Flex flexGrow="1" direction="column" minHeight="0" align="stretch">
        {!optionsReady || options === null ? (
          <Flex flexGrow="1" align="center" justify="center">
            <Spinner />
          </Flex>
        ) : (
          <Debugger
            script={source}
            options={options}
            session={session}
            onDebugScript={handleValidate}
            scriptSlot={
              <ReactMonacoEditor
                height="100%"
                language="javascript"
                value={source}
                onChange={(value) => setSource(value ?? '')}
                path={`cloud-workspace/${ref}.js`}
                showToolbar
              />
            }
          />
        )}
      </Flex>
    </View>
  )
}
