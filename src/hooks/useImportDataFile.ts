import { useToast } from '@/store/ui/useToast'
import log from 'electron-log/renderer'
import { useCallback } from 'react'

export function useImportDataFile() {
  const showToast = useToast()

  return useCallback(async () => {
    try {
      const fileName = await window.studio.data.importFile()

      if (fileName) {
        showToast({
          title: `Imported ${fileName}`,
          status: 'success',
        })
      }

      return fileName
    } catch (error) {
      showToast({
        title: 'Failed to import data file',
        status: 'error',
      })
      log.error(error)
    }
  }, [showToast])
}
