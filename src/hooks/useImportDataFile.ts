import log from 'electron-log/renderer'
import { parse } from 'pathe'
import { useCallback } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'

export function useImportDataFile() {
  const showToast = useToast()
  const addFile = useStudioUIStore((state) => state.addFile)

  return useCallback(async () => {
    try {
      const filePath = await window.studio.data.importFile()

      if (filePath) {
        const { base, name } = parse(filePath)

        showToast({
          title: `Imported ${base}`,
          status: 'success',
        })

        // There's a slight delay between the import handler and the add callback being triggered,
        // causing the UI in Test data options to flicker because it thinks the imported file
        // is actually missing. To prevent this, we optimistically update the file list.
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
        title: 'Failed to import data file',
        status: 'error',
      })
      log.error(error)
    }
  }, [addFile, showToast])
}
