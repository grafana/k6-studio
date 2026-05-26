import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { Recording } from '@/schemas/recording'
import { StudioFile } from '@/types'
import { harToProxyData } from '@/utils/harToProxyData'

import { RecordingInspector } from '../Recorder/RecordingInspector'

import { RecordingPreviewControls } from './RecordingPreviewerControls'

interface RecordingPreviewerProps {
  file: StudioFile
  content: Recording
}

export function RecordingPreviewer({ file, content }: RecordingPreviewerProps) {
  const proxyData = harToProxyData(content)
  const browserEvents = content.log._browserEvents?.events ?? []

  const groups = useProxyDataGroups(proxyData)

  return (
    <View
      title="Recording"
      subTitle={<FileNameHeader file={file} />}
      actions={
        <RecordingPreviewControls
          file={file}
          isExternal={false}
          browserEvents={browserEvents}
        />
      }
    >
      <RecordingInspector
        groups={groups}
        requests={proxyData}
        browserEvents={browserEvents}
      />
    </View>
  )
}
