import { Flex } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { BrowserReplayEvent } from '@/main/runner/schema'
import { getRoutePath } from '@/routeMap'
import { BrowserEvent, ValidatorBrowserPersist } from '@/schemas/recording'
import { useToast } from '@/store/ui/useToast'
import { ProxyData, StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { harToProxyData } from '@/utils/harToProxyData'

import { RecordingInspector } from '../Recorder/RecordingInspector'
import { BrowserDebugger } from '../Validator/Browser/BrowserDebugger'
import { HttpDebugger } from '../Validator/HTTP/HttpDebugger'
import { DebugSession } from '../Validator/types'

import { ValidatorRunPreviewerControls } from './ValidatorRunPreviewerControls'

export function ValidatorRunPreviewer() {
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [browserEvents, setBrowserEvents] = useState<BrowserEvent[]>([])
  const [validatorBrowserPersist, setValidatorBrowserPersist] =
    useState<ValidatorBrowserPersist | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const { fileName } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()

  invariant(fileName, 'fileName is required')
  const decoded = decodeURIComponent(fileName)
  const baseName = decoded.split(/[/\\]/).pop() ?? decoded
  const file: StudioFile = {
    fileName: decoded,
    displayName: getFileNameWithoutExtension(baseName),
    type: 'validator-run',
  }

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setProxyData([])
      try {
        const har = await window.studio.validatorRun.openFile(decoded)
        setIsLoading(false)

        invariant(har, 'Failed to open file')

        setProxyData(harToProxyData(har))
        setBrowserEvents(har.log._browserEvents?.events ?? [])
        setValidatorBrowserPersist(har.log._k6StudioValidatorBrowser ?? null)
      } catch {
        showToast({
          title: 'Failed to load validator run',
          status: 'error',
        })
        navigate(getRoutePath('home'))
      }
    })()

    return () => {
      setProxyData([])
      setBrowserEvents([])
      setValidatorBrowserPersist(null)
    }
  }, [decoded, navigate, showToast])

  const groups = useProxyDataGroups(proxyData)

  const persisted = validatorBrowserPersist

  const browserPreviewSession: DebugSession | null =
    persisted !== null &&
    (persisted.actions.length > 0 || persisted.replay.length > 0)
      ? {
          id: decoded,
          state: 'stopped',
          requests: proxyData,
          browser: {
            actions: persisted.actions,
            replay: persisted.replay as BrowserReplayEvent[],
          },
          logs: persisted.logs,
          checks: [],
        }
      : null

  const httpLogsPreviewSession: DebugSession | null =
    persisted !== null &&
    persisted.actions.length === 0 &&
    persisted.replay.length === 0 &&
    persisted.logs.length > 0
      ? {
          id: decoded,
          state: 'stopped',
          requests: proxyData,
          browser: { actions: [], replay: [] },
          logs: persisted.logs,
          checks: [],
        }
      : null

  return (
    <View
      title="Validator run"
      subTitle={<FileNameHeader file={file} />}
      loading={isLoading}
      actions={<ValidatorRunPreviewerControls file={file} />}
    >
      {!isLoading &&
        (browserPreviewSession !== null ? (
          <Flex
            flexGrow="1"
            direction="column"
            align="stretch"
            overflow="hidden"
          >
            <BrowserDebugger
              script=""
              session={browserPreviewSession}
              onDebugScript={() => {}}
              overviewInitialTab="replay"
              replayStartsAtBeginning
            />
          </Flex>
        ) : httpLogsPreviewSession !== null ? (
          <Flex
            flexGrow="1"
            direction="column"
            align="stretch"
            overflow="hidden"
          >
            <HttpDebugger
              session={httpLogsPreviewSession}
              onDebugScript={() => {}}
            />
          </Flex>
        ) : (
          <RecordingInspector
            groups={groups}
            requests={proxyData}
            browserEvents={browserEvents}
          />
        ))}
    </View>
  )
}
