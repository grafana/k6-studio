import { Button } from '@radix-ui/themes'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { FileLocation } from '@/handlers/fs/types'
import { getViewPath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import * as path from '@/utils/path'

import { useSaveFile } from './useSaveFile'

interface UseExportScriptOptions {
  openOnSave?: boolean
  enableMenuItem?: boolean
  fileName: string
  content: (filePath: string) => Promise<string> | string
  onSuccess?: (location: FileLocation) => void
  onError?: (error: Error) => void
}

export function useExportScript({
  fileName,
  openOnSave = false,
  enableMenuItem = true,
  content,
  onSuccess,
  onError,
}: UseExportScriptOptions) {
  const showToast = useToast()
  const navigate = useNavigate()

  const exportScript = useSaveFile({
    menuItems: enableMenuItem ? ['export-script'] : [],
    location: {
      type: 'untitled',
      hint: path.extname(fileName) === '' ? `${fileName}.js` : fileName,
    },
    content: async (location) => ({
      type: 'script',
      data: await content(location.path),
      isExternal: false,
      options: {},
    }),
    filters: [{ name: 'k6 test scripts', extensions: ['js'] }],
    onSave(location) {
      const viewPath = getViewPath('script', location.path)

      if (openOnSave) {
        onSuccess?.(location)
        navigate(viewPath)

        return
      }

      showToast({
        title: 'Script exported successfully',
        status: 'success',
        action: (
          <Button variant="ghost" onClick={() => navigate(viewPath)}>
            Open
          </Button>
        ),
      })

      onSuccess?.(location)
    },
    onError(error) {
      showToast({
        title: 'Failed to export the script.',
        status: 'error',
        description: error.message,
      })

      onError?.(error)
    },
  })

  return useCallback(() => {
    return exportScript({ saveAs: false })
  }, [exportScript])
}
