import log from 'electron-log/renderer'
import { useCallback } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'

export function useImportDataFile() {
  const showToast = useToast()
  const addFile = useStudioUIStore((state) => state.addFile)

  return useCallback(async () => {
    try {
      const file = await window.studio.data.importFile()

      if (file) {
        showToast({
          title: `Imported ${file.fileName}`,
          status: 'success',
        })

        // There's a slight delay between the import handler and the add callback being triggered,
        // causing the UI in Test data options to flicker because it thinks the imported file
        // is actually missing. To prevent this, we optimistically update the file list.
        addFile(file)
      }

      return file?.fileName
    } catch (error) {
      showToast({
        title: 'Failed to import data file',
        status: 'error',
      })
      log.error(error)
    }
  }, [addFile, showToast])
}
