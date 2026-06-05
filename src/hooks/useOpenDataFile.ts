import log from 'electron-log/renderer'
import { useCallback } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import * as path from '@/utils/path'

export function useOpenDataFile() {
  const showToast = useToast()
  const addFile = useStudioUIStore((state) => state.addFile)

  return useCallback(async () => {
    try {
      const filePath = await window.studio.data.openFile()

      if (filePath) {
        const { base, name } = path.parse(filePath)

        showToast({
          title: `Opened ${base}`,
          status: 'success',
        })

        // Optimistically update the file list so the UI reflects the new file
        // immediately, without waiting for the file watcher.
        addFile({
          type: 'data-file',
          path: filePath,
          fileName: base,
          displayName: name,
        })
      }

      return filePath
    } catch (error) {
      showToast({
        title: 'Failed to open data file',
        status: 'error',
      })
      log.error(error)
    }
  }, [addFile, showToast])
}
