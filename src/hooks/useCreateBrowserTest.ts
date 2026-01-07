import { useCallback } from 'react'

import { useToast } from '@/store/ui/useToast'

export function useCreateBrowserTest() {
  const showToast = useToast()

  return useCallback(async () => {
    try {
      const fileName = await window.studio.browserTest.create()
      console.log('Created browser test:', fileName)
      showToast({
        status: 'success',
        title: `${fileName} created`,
      })
    } catch {
      showToast({
        status: 'error',
        title: 'Failed to create browser test',
      })
    }
  }, [showToast])
}
