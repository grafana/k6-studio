import { useMutation, useQuery } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { queryClient } from '@/utils/query'
import { exhaustive } from '@/utils/typescript'

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
  const [state, setState] = useState<BrowserActionInstance[]>(
    actions.map(toBrowserActionInstance)
  )

  const addAction = (method: BrowserActionInstance['method']) => {
    const action = createNewAction(method)
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
    isDirty,
  }
}

function toBrowserActionInstance(
  action: AnyBrowserAction
): BrowserActionInstance {
  const id = crypto.randomUUID()

  if ('locator' in action) {
    return {
      id,
      ...action,
      locator: {
        current: action.locator.type,
        values: {
          [action.locator.type]: action.locator,
        },
      },
    }
  }

  return { id, ...action }
}

function fromBrowserActionInstance({
  id: _id,
  ...action
}: BrowserActionInstance): AnyBrowserAction {
  if ('locator' in action) {
    const locator = action.locator.values[action.locator.current]

    if (locator === undefined) {
      throw new Error(
        `Current locator of type "${action.locator.current}" not found in locator values.`
      )
    }

    return {
      ...action,
      locator,
    }
  }

  return action
}

function createNewAction(
  method: BrowserActionInstance['method']
): BrowserActionInstance {
  const id = crypto.randomUUID()
  switch (method) {
    case 'page.goto':
      return {
        id,
        method,
        url: 'https://example.com',
      }
    case 'page.reload':
      return {
        id,
        method,
      }
    case 'locator.waitFor':
      return {
        id,
        method,
        locator: {
          current: 'css',
          values: {
            css: {
              type: 'css',
              selector: '',
            },
          },
        },
      }
    case 'page.waitForNavigation':
    case 'page.*':
    case 'locator.click':
    case 'locator.dblclick':
    case 'locator.fill':
    case 'locator.type':
    case 'locator.check':
    case 'locator.uncheck':
    case 'locator.selectOption':
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
