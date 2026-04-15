import { useMutation, useQuery } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { debounce } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { emitScript } from '@/codegen/browser'
import { convertActionsToTest } from '@/codegen/browser/test'
import {
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'
import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { queryClient } from '@/utils/query'

import {
  fromBrowserActionInstance,
  toBrowserActionInstance,
} from './actionAdapters'
import { createActionInstance } from './actionEditorRegistry'
import { BrowserActionInstance } from './types'

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
  const showToast = useToast()

  return useMutation({
    mutationFn: async (data: BrowserTestFile) => {
      await window.studio.browserTest.save(fileName, data)
      await queryClient.invalidateQueries({
        queryKey: ['browserTest', fileName],
      })
    },

    onSuccess: () => {
      showToast({
        title: 'Browser test saved',
        status: 'success',
      })
    },

    onError: (error) => {
      showToast({
        title: 'Failed to save browser test',
        status: 'error',
        description: error.message,
      })
      log.error(error)
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

  const onTabClick = useCallback(() => {
    if (drawer?.isCollapsed()) {
      drawer?.resize(300)
    }
  }, [drawer])

  return { drawerLayout, mainLayout, setDrawer, onTabClick }
}

export function useBrowserScriptPreview(
  browserActions: BrowserActionInstance[]
) {
  const [preview, setPreview] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generatePreview = useCallback(
    debounce(async (actions: BrowserActionInstance[]) => {
      try {
        const test = convertActionsToTest({
          browserActions: actions,
        })

        const script = await emitScript(test)
        setPreview(script)
      } catch (error) {
        setPreview(
          `// Failed to generate script preview:\n// ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }, 300),
    []
  )

  useEffect(() => {
    void generatePreview(browserActions)

    return () => generatePreview.cancel()
  }, [browserActions, generatePreview])

  return preview
}

export function useBrowserTestState(
  browserTestFile: BrowserTestFile | undefined
) {
  const { actions = [] } = browserTestFile ?? {}
  const [state, setState] = useState<BrowserActionInstance[]>(
    actions.map(toBrowserActionInstance)
  )

  const addAction = (method: BrowserActionInstance['method']) => {
    const action = createActionInstance(method)
    setState([...state, action])
  }

  const updateAction = (updatedAction: BrowserActionInstance) => {
    const newActions = state.map((action) =>
      action.id === updatedAction.id ? updatedAction : action
    )
    setState(newActions)
  }

  const removeAction = (id: string) => {
    const newActions = state.filter((actionWithId) => actionWithId.id !== id)
    setState(newActions)
  }

  const fileActions = useMemo(() => {
    return state.map(fromBrowserActionInstance)
  }, [state])

  const isDirty = useMemo(() => {
    return (
      fileActions.length !== actions.length ||
      JSON.stringify(fileActions) !== JSON.stringify(actions)
    )
  }, [fileActions, actions])

  return {
    actions: state,
    fileActions,
    addAction,
    updateAction,
    removeAction,
    isDirty,
  }
}
