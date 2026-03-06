import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useCurrentFile } from '@/hooks/useFileNameParam'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useSettings } from '@/hooks/useSettings'
import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'

import { RecordingInspector } from '../Recorder/RecordingInspector'
import { RequestLog } from '../Recorder/RequestLog'

import { RecordingPreviewControls } from './RecordingPreviewerControls'

export function RecordingPreviewer() {
  const { data: settings } = useSettings()

  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [browserEvents, setBrowserEvents] = useState<BrowserEvent[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const file = useCurrentFile('recording')

  const browserRecorderSetting =
    settings?.recorder.browserRecording ?? 'disabled'

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setProxyData([])
      const data = await window.studio.har.openFile(file.path)
      setIsLoading(false)

      invariant(data, 'Failed to open file')

      setProxyData(data.requests)
      setBrowserEvents(data.browserEvents)
    })()

    return () => {
      setProxyData([])
      setBrowserEvents([])
    }
  }, [file.path])

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
