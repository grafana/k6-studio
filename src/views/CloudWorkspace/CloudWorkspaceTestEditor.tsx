import { css } from '@emotion/react'
import { Box, Button, Flex, Spinner, Text } from '@radix-ui/themes'
import { SaveIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ReactMonacoEditor } from '@/components/Monaco/ReactMonacoEditor'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import {
  type CloudTestRefString,
  parseCloudTestRef,
} from '@/handlers/cloudWorkspace/types'

export function CloudWorkspaceTestEditor() {
  const { ref: refParam } = useParams<{ ref: string }>()
  const ref = refParam ? decodeURIComponent(refParam) : ''
  const parsed = parseCloudTestRef(ref)

  const [source, setSource] = useState('')
  const [savedSource, setSavedSource] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'saving' | 'running'
  >('idle')

  const isDirty = source !== savedSource

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

  const handleRun = useCallback(async () => {
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
    <Flex direction="column" height="100%" overflow="hidden">
      <Flex
        align="center"
        justify="between"
        px="3"
        py="2"
        gap="3"
        css={css`
          border-bottom: 1px solid var(--gray-5);
          flex-shrink: 0;
        `}
      >
        <Text
          size="2"
          weight="medium"
          css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          Cloud test · {ref}
        </Text>
        <Flex gap="2" align="center">
          {loadError && (
            <Text size="1" color="red">
              {loadError}
            </Text>
          )}
          <Button
            variant="surface"
            disabled={status !== 'idle' || !isDirty}
            onClick={() => void handleSave()}
          >
            <SaveIcon size={16} /> Save
          </Button>
          <Button disabled={status !== 'idle'} onClick={() => void handleRun()}>
            <GrafanaIcon /> Run in Grafana Cloud
          </Button>
        </Flex>
      </Flex>
      <Box flexGrow="1" minHeight="0">
        <ReactMonacoEditor
          height="100%"
          language="javascript"
          value={source}
          onChange={(value) => setSource(value ?? '')}
          path={`cloud-workspace/${ref}.js`}
          showToolbar
        />
      </Box>
    </Flex>
  )
}
