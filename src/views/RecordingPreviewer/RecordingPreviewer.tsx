import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { RecordingContent } from '@/handlers/fs/types'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { StudioFile } from '@/types'

import { RecordingInspector } from '../Recorder/RecordingInspector'

import { RecordingPreviewControls } from './RecordingPreviewerControls'

interface RecordingPreviewerProps {
  file: StudioFile
  content: RecordingContent
}

export function RecordingPreviewer({ file, content }: RecordingPreviewerProps) {
  const proxyData = content.data
  const browserEvents = content.browserEvents

  const groups = useProxyDataGroups(proxyData)

  return (
    <View
      title="Recording"
      subTitle={<FileNameHeader file={file} canRename={!content.isExternal} />}
      actions={
        <RecordingPreviewControls
          file={file}
          isExternal={content.isExternal}
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
