import { arrayMove } from '@dnd-kit/sortable'
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

export function useValidatorScript(browserActions: BrowserActionInstance[]) {
  // We add a timeout to the end of the script to give the page time to load the page, so that
  // there's something that the user can interact with. If we don't do this, k6 will stop before
  // any DOM mutations have been recorded.
  const validatorActions: BrowserActionInstance[] = useMemo(
    () => [
      ...browserActions,
      {
        id: '_validator_timeout_',
        method: 'page.waitForTimeout',
        timeout: 3000,
      },
    ],
    [browserActions]
  )

  return useBrowserScriptPreview(validatorActions)
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

  const reorderActions = useCallback((activeId: string, overId: string) => {
    setState((prev) => {
      const oldIndex = prev.findIndex((a) => a.id === activeId)
      const newIndex = prev.findIndex((a) => a.id === overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prev
      }
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const plainActions = useMemo(() => {
    return state.map(fromBrowserActionInstance)
  }, [state])

  const isDirty = useMemo(() => {
    return (
      plainActions.length !== actions.length ||
      JSON.stringify(plainActions) !== JSON.stringify(actions)
    )
  }, [plainActions, actions])

  return {
    actions: state,
    plainActions,
    addAction,
    updateAction,
    removeAction,
    reorderActions,
    isDirty,
  }
}
