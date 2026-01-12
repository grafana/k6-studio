import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { emitScript } from '@/codegen/browser'
import { convertToTest } from '@/codegen/browser/test'
import { BrowserTestFile } from '@/schemas/browserTest/v1'

export function useBrowserTest(fileName: string) {
  return useQuery({
    queryKey: ['browserTest', fileName],
    queryFn: () => {
      return window.studio.browserTest.open(fileName)
    },
  })
}

export function useBrowserScriptPreview(actions: BrowserTestFile['actions']) {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    // Add error handling?
    async function generatePreview() {
      const test = convertToTest({
        browserEvents: [],
      })

      const script = await emitScript(test)
      setPreview(script)
    }

    void generatePreview()
  }, [actions])

  console.log('Generated browser script preview:', preview)

  return preview
}
