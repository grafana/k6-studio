import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useSettings } from '@/hooks/useSettings'
import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'
import { getStudioFileFromPath } from '@/utils/file'

import { RecordingInspector } from '../Recorder/RecordingInspector'
import { RequestLog } from '../Recorder/RequestLog'

import { RecordingPreviewControls } from './RecordingPreviewerControls'

function useRecordingFile() {
  const { fileName } = useParams()

  invariant(fileName, 'fileName is required')

  return getStudioFileFromPath('recording', fileName)
}

export function RecordingPreviewer() {
  const { data: settings } = useSettings()

  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [browserEvents, setBrowserEvents] = useState<BrowserEvent[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const file = useRecordingFile()

  const browserRecorderSetting =
    settings?.recorder.browserRecording ?? 'disabled'

  useEffect(() => {
    setIsLoading(true)

    window.studio.files
      .open(file.filePath, 'recording')
      .then((file) => {
        if (file === null) {
          throw new Error('Failed to load recording file.')
        }

        if (file.content.type !== 'recording') {
          throw new Error('Invalid recording file type.')
        }

        setProxyData(file.content.requests)
        setBrowserEvents(file.content.browserEvents)
      })
      .catch((error) => {
        console.error(error)

        navigate('/home')
      })
      .finally(() => {
        setIsLoading(false)
      })

    return () => {
      setProxyData([])
      setBrowserEvents([])
    }
  }, [file.filePath, navigate])

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
