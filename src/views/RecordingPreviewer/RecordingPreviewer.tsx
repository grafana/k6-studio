import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useFileNameParam } from '@/hooks/useFileNameParam'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useSettings } from '@/hooks/useSettings'
import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'
import { harToProxyData } from '@/utils/harToProxyData'

import { RecordingInspector } from '../Recorder/RecordingInspector'
import { RequestLog } from '../Recorder/RequestLog'

import { RecordingPreviewControls } from './RecordingPreviewerControls'

export function RecordingPreviewer() {
  const { data: settings } = useSettings()

  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [browserEvents, setBrowserEvents] = useState<BrowserEvent[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const file = useFileNameParam('recording')
  const navigate = useNavigate()

  const browserRecorderSetting =
    settings?.recorder.browserRecording ?? 'disabled'

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setProxyData([])
      const har = await window.studio.har.openFile(file.path)
      setIsLoading(false)

      invariant(har, 'Failed to open file')

      setProxyData(harToProxyData(har))
      setBrowserEvents(har.log._browserEvents?.events ?? [])
    })()

    return () => {
      setProxyData([])
      setBrowserEvents([])
    }
  }, [file.path, navigate])

  const groups = useProxyDataGroups(proxyData)

  return (
    <View
      title="Recording"
      subTitle={<FileNameHeader file={file} />}
      loading={isLoading}
      actions={
        <RecordingPreviewControls file={file} browserEvents={browserEvents} />
      }
    >
      {!isLoading && browserRecorderSetting !== 'disabled' && (
        <RecordingInspector
          groups={groups}
          requests={proxyData}
          browserEvents={browserEvents}
        />
      )}

      {!isLoading && browserRecorderSetting === 'disabled' && (
        <RequestLog groups={groups} requests={proxyData} />
      )}
    </View>
  )
}
