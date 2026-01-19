import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { emitScript } from '@/codegen/browser'
import { convertActionsToTest } from '@/codegen/browser/test'
import {
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'
import { AnyBrowserAction } from '@/main/runner/schema'
import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { queryClient } from '@/utils/query'

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
  return useQuery<BrowserTestFile>({
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['browserTest', fileName],
      })
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

export function useBrowserScriptPreview(browserActions: AnyBrowserAction[]) {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    async function generatePreview() {
      try {
        const test = convertActionsToTest({
          browserActions,
        })

        const script = await emitScript(test)
        setPreview(script)
      } catch (error) {
        setPreview(
          `// Failed to generate script preview:\n// ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    void generatePreview()
  }, [browserActions])

  return preview
}
