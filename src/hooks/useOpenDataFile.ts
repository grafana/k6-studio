import log from 'electron-log/renderer'
import { useCallback } from 'react'

import { useToast } from '@/store/ui/useToast'
import * as path from '@/utils/path'

export function useOpenDataFile() {
  const showToast = useToast()

  return useCallback(async () => {
    try {
      const filePath = await window.studio.data.openFile()

      if (filePath === undefined) {
        return undefined
      }

      showToast({
        title: `Opened ${path.basename(filePath)}`,
        status: 'success',
      })

      return filePath
    } catch (error) {
      showToast({
        title: 'Failed to open data file',
        status: 'error',
      })
      log.error(error)
    }
  }, [showToast])
}
