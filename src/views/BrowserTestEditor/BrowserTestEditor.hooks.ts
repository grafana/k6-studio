import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { emitScript } from '@/codegen/browser'
import { convertActionsToTest } from '@/codegen/browser/test'
import {
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'
import { useCurrentFile } from '@/hooks/useFileNameParam'
import { useStateWithUndo } from '@/hooks/useStateWithUndo'
import { AnyBrowserAction } from '@/main/runner/schema'
import { BrowserTestFile } from '@/schemas/browserTest/v1'
import { StudioFile } from '@/types'
import { exhaustive } from '@/utils/typescript'

import { BrowserActionWithId } from './types'

export function useBrowserTestFile(): StudioFile {
  return useCurrentFile('browser-test')
}

export function useBrowserTest(fileName: string) {
  return useQuery<BrowserTestFile>({
    queryKey: ['browserTest', fileName],
    queryFn: async () => {
      const result = await window.studio.file.open(fileName)

      if (result.type !== 'browser-test') {
        throw new Error('Expected browser-test content')
      }

      return result.data
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

export function useBrowserTestState(
  browserTestFile: BrowserTestFile | undefined
) {
  const { actions = [] } = browserTestFile ?? {}
  const { state, undo, redo, push } = useStateWithUndo<BrowserActionWithId[]>(
    actions.map((action) => ({
      id: crypto.randomUUID(),
      action,
    }))
  )

  const addAction = (method: AnyBrowserAction['method']) => {
    const action = createNewAction(method)
    push([...state, { id: crypto.randomUUID(), action }])
  }

  const updateAction = (updatedAction: BrowserActionWithId) => {
    const newActions = state.map((action) =>
      action.id === updatedAction.id ? updatedAction : action
    )
    push(newActions)
  }

  const removeAction = (id: string) => {
    const newActions = state.filter((actionWithId) => actionWithId.id !== id)
    push(newActions)
  }

  const plainActions = useMemo(() => {
    return state.map((actionWithId) => actionWithId.action)
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
    isDirty,
    undo,
    redo,
  }
}

function createNewAction(method: AnyBrowserAction['method']): AnyBrowserAction {
  switch (method) {
    case 'page.goto':
      return {
        method: 'page.goto',
        url: 'https://example.com',
      }
    case 'page.reload':
    case 'page.waitForNavigation':
    case 'page.close':
    case 'page.*':
    case 'locator.click':
    case 'locator.dblclick':
    case 'locator.fill':
    case 'locator.type':
    case 'locator.check':
    case 'locator.uncheck':
    case 'locator.selectOption':
    case 'locator.waitFor':
    case 'locator.hover':
    case 'locator.setChecked':
    case 'locator.tap':
    case 'locator.clear':
    case 'locator.press':
    case 'locator.focus':
    case 'locator.*':
    case 'browserContext.*':
      throw new Error(`Action ${method} not implemented yet`)
    default:
      return exhaustive(method)
  }
}
