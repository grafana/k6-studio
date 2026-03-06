import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useSettings } from '@/hooks/useSettings'
import { StudioFile } from '@/types'
import { RecordingData } from '@/types/recordingData'

import { RecordingInspector } from '../Recorder/RecordingInspector'
import { RequestLog } from '../Recorder/RequestLog'

import { RecordingPreviewControls } from './RecordingPreviewerControls'

interface RecordingPreviewerProps {
  file: StudioFile
  data: RecordingData
}

export function RecordingPreviewer({ file, data }: RecordingPreviewerProps) {
  const { data: settings } = useSettings()

  const { requests: proxyData, browserEvents } = data
  const groups = useProxyDataGroups(proxyData)

  const browserRecorderSetting =
    settings?.recorder.browserRecording ?? 'disabled'

  return (
    <View
      title="Recording"
      subTitle={<FileNameHeader file={file} />}
      actions={
        <RecordingPreviewControls file={file} browserEvents={browserEvents} />
      }
    >
      {browserRecorderSetting !== 'disabled' ? (
        <RecordingInspector
          groups={groups}
          requests={proxyData}
          browserEvents={browserEvents}
        />
      ) : (
        <RequestLog groups={groups} requests={proxyData} />
      )}
    </View>
  )
}
