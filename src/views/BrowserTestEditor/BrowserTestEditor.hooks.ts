import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { emitScript } from '@/codegen/browser'
import { convertToTest } from '@/codegen/browser/test'
import {
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'
import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'

export function useBrowserTestFile(): StudioFile {
  const { fileName } = useParams()
  invariant(fileName, 'fileName is required')

  return {
    fileName,
    displayName: getFileNameWithoutExtension(fileName),
    type: 'browser-test',
  }
}

export function useBrowserTest(fileName: string) {
  return useQuery({
    queryKey: ['browserTest', fileName],
    queryFn: () => {
      return window.studio.browserTest.open(fileName)
    },
  })
}

export function useSaveBrowserTest(fileName: string) {
  return useMutation({
    mutationFn: (data: BrowserTestFile) => {
      return window.studio.browserTest.save(fileName, data)
    },
  })
}

export function useBrowserTestEditorLayout() {
  const [drawer, setDrawer] = usePanelCallbackRef()

  const drawerLayout = useDefaultLayout({
    groupId: 'browser-editor-drawer',
    storage: localStorage,
  })
  const mainLayout = useDefaultLayout({
    groupId: 'browser-editor-main',
    storage: localStorage,
  })

  function onTabClick() {
    if (drawer?.isCollapsed()) {
      drawer?.resize(300)
    }
  }

  return { drawerLayout, mainLayout, setDrawer, onTabClick }
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
