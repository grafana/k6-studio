import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useCurrentFile } from '@/hooks/useCurrentFile'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'

import { RecordingInspector } from '../Recorder/RecordingInspector'

import { RecordingPreviewControls } from './RecordingPreviewerControls'

export function RecordingPreviewer() {
  const [isExternal, setIsExternal] = useState(false)
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [browserEvents, setBrowserEvents] = useState<BrowserEvent[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const file = useCurrentFile('recording')
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setProxyData([])
      const content = await window.studio.fs.openFile(file.path)
      setIsLoading(false)

      if (content.type !== 'recording') {
        throw new Error(`Expected recording content, got ${content.type}`)
      }

      setIsExternal(content.isExternal)
      setProxyData(content.data)
      setBrowserEvents(content.browserEvents)
    })()

    return () => {
      setIsExternal(false)
      setProxyData([])
      setBrowserEvents([])
    }
  }, [file.path, navigate])

  const groups = useProxyDataGroups(proxyData)

  return (
    <View
      title="Recording"
      subTitle={<FileNameHeader file={file} canRename={!isExternal} />}
      loading={isLoading}
      actions={
        <RecordingPreviewControls
          file={file}
          isExternal={isExternal}
          browserEvents={browserEvents}
        />
      }
    >
      {!isLoading && (
        <RecordingInspector
          groups={groups}
          requests={proxyData}
          browserEvents={browserEvents}
        />
      )}
    </View>
  )
}
