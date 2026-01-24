import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { emitScript } from '@/codegen/browser'
import { convertToTest } from '@/codegen/browser/test'
import { StudioFile } from '@/types'
import { getStudioFileFromPath } from '@/utils/file'

export function useBrowserTestFile(): StudioFile {
  const { fileName } = useParams()
  invariant(fileName, 'fileName is required')

  return getStudioFileFromPath('browser-test', fileName)
}

export function useBrowserTest(file: StudioFile) {
  return useQuery({
    queryKey: ['browserTest', file.filePath],
    queryFn: () => {
      return window.studio.files
        .open(file.filePath, 'browser-test')
        .then((file) => {
          if (file === null) {
            throw new Error('Failed to load browser test file.')
          }

          if (file.content.type !== 'browser-test') {
            throw new Error('Invalid browser test file type.')
          }

          return file.content.test
        })
    },
  })
}

// TODO: Use actions to generate the script
export function useBrowserScriptPreview() {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    async function generatePreview() {
      try {
        const test = convertToTest({
          browserEvents: [],
        })

        const script = await emitScript(test)
        setPreview(script)
      } catch (error) {
        setPreview(
          `// Failed to generate preview: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    void generatePreview()
  }, [])

  return preview
}
