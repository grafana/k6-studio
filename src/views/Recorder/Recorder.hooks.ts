import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { useRecorderStore } from '@/store/recorder'
import { getFileNameFromPath } from '@/utils/file'
import { harToProxyData } from '@/utils/harToProxyData'

export function useRecorderView(group: string) {
  const { path } = useParams()
  const isNewRecording = path === undefined
  const setProxyData = useRecorderStore((store) => store.setProxyData)
  const resetProxyData = useRecorderStore((store) => store.resetProxyData)

  useSetWindowTitle(isNewRecording ? 'Recorder' : getFileNameFromPath(path))
  useListenProxyData(group)

  useEffect(() => {
    if (!path) {
      resetProxyData()
      return
    }

    ;(async () => {
      const har = await window.studio.har.openFile(path)

      if (!har) {
        return
      }

      setProxyData(harToProxyData(har.content))
    })()

    return () => {
      resetProxyData()
    }
  }, [path, setProxyData, resetProxyData])

  return { path }
}
