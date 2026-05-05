import { arrayMove } from '@dnd-kit/sortable'
import { useMutation, useQuery } from '@tanstack/react-query'
import log from 'electron-log/renderer'
import { debounce, isEqual } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { emitScript } from '@/codegen/browser'
import { convertActionsToTest } from '@/codegen/browser/test'
import {
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'
import {
  BrowserTestFile,
  BrowserTestOptions,
  BrowserThreshold,
  defaultBrowserTestOptions,
} from '@/schemas/browserTest'
import { useToast } from '@/store/ui/useToast'
import { LoadProfileExecutorOptions, LoadZoneData } from '@/types/testOptions'
import { getInitialStages } from '@/utils/generator'
import { stripUndefined } from '@/utils/object'
import { basename } from '@/utils/path'
import { queryClient } from '@/utils/query'

import {
  fromBrowserActionInstance,
  toBrowserActionInstance,
} from './actionAdapters'
import { BrowserActionInstance } from './types'

export function useBrowserTest(fileName: string) {
  return useQuery<BrowserTestFile>({
    queryKey: ['browserTest', fileName],
    queryFn: () => {
      return window.studio.browserTest.open(fileName)
    },
  })
}

export function useSaveBrowserTest(filePath: string) {
  const showToast = useToast()

  return useMutation({
    mutationFn: async (data: BrowserTestFile) => {
      await window.studio.browserTest.save(filePath, data)
      await queryClient.invalidateQueries({
        queryKey: ['browserTest', basename(filePath)],
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
  browserActions: BrowserActionInstance[],
  settings?: BrowserTestOptions
) {
  const [preview, setPreview] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generatePreview = useCallback(
    debounce(
      async (
        actions: BrowserActionInstance[],
        currentSettings: BrowserTestOptions | undefined
      ) => {
        try {
          const test = convertActionsToTest({
            browserActions: actions,
            settings: currentSettings,
          })

          const script = await emitScript(test)
          setPreview(script)
        } catch (error) {
          setPreview(
            `// Failed to generate script preview:\n// ${error instanceof Error ? error.message : String(error)}`
          )
        }
      },
      300
    ),
    []
  )

  useEffect(() => {
    void generatePreview(browserActions, settings)

    return () => generatePreview.cancel()
  }, [browserActions, settings, generatePreview])

  return preview
}

export function useValidatorScript(
  browserActions: BrowserActionInstance[],
  settings?: BrowserTestOptions
) {
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

  return useBrowserScriptPreview(validatorActions, settings)
}

// Browser tests start with `shared-iterations` and no stages, but the
// `<LoadProfile>` form requires a stages array to validate when the user
// switches to `ramping-vus`. Carry default stages alongside the active branch
// so the form always validates; codegen reads only the active branch.
function withSeededStages(
  loadProfile: LoadProfileExecutorOptions
): LoadProfileExecutorOptions {
  if ('stages' in loadProfile && (loadProfile.stages?.length ?? 0) > 0) {
    return loadProfile
  }
  const seeded = { ...loadProfile, stages: getInitialStages() }
  return seeded
}

export function useBrowserTestState(
  browserTestFile: BrowserTestFile | undefined
) {
  const { actions = [], settings = defaultBrowserTestOptions } =
    browserTestFile ?? {}

  const [actionState, setActionState] = useState<BrowserActionInstance[]>(
    actions.map(toBrowserActionInstance)
  )
  const [settingsState, setSettingsState] = useState<BrowserTestOptions>(
    () => ({
      ...settings,
      loadProfile: withSeededStages(settings.loadProfile),
    })
  )

  useEffect(() => {
    const { settings: fileSettings } = browserTestFile ?? {}
    const resolvedSettings = fileSettings ?? defaultBrowserTestOptions
    const nextSettings: BrowserTestOptions = {
      ...resolvedSettings,
      loadProfile: withSeededStages(resolvedSettings.loadProfile),
    }
    setSettingsState((prev) =>
      isEqual(stripUndefined(prev), stripUndefined(nextSettings))
        ? prev
        : nextSettings
    )
  }, [browserTestFile])

  const addAction = (action: BrowserActionInstance) => {
    setActionState([...actionState, action])
  }

  const updateAction = (updatedAction: BrowserActionInstance) => {
    setActionState(
      actionState.map((action) =>
        action.id === updatedAction.id ? updatedAction : action
      )
    )
  }

  const removeAction = (id: string) => {
    setActionState(actionState.filter((action) => action.id !== id))
  }

  const reorderActions = useCallback((activeId: string, overId: string) => {
    setActionState((prev) => {
      const oldIndex = prev.findIndex((action) => action.id === activeId)
      const newIndex = prev.findIndex((action) => action.id === overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prev
      }
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  const setLoadProfile = useCallback(
    (loadProfile: LoadProfileExecutorOptions) =>
      setSettingsState((prev) => ({
        ...prev,
        // Merge so inactive-branch fields (e.g. user's stages while
        // shared-iterations is active) survive an executor switch. Codegen
        // reads only the active branch, so shadow fields are inert.
        loadProfile: {
          ...prev.loadProfile,
          ...loadProfile,
        },
      })),
    []
  )

  const setThresholds = useCallback(
    (thresholds: BrowserThreshold[]) =>
      setSettingsState((prev) => ({ ...prev, thresholds })),
    []
  )

  const setLoadZones = useCallback(
    (loadZones: LoadZoneData) =>
      setSettingsState((prev) => ({ ...prev, cloud: { loadZones } })),
    []
  )

  const plainActions = useMemo(
    () => actionState.map(fromBrowserActionInstance),
    [actionState]
  )

  const isDirty = useMemo(() => {
    // Baseline widens stages to match the in-memory state so seeded defaults
    // aren't seen as edits. Compare strips undefined keys (RHF emits cleared
    // inputs as `key: undefined`, while Zod parse drops them entirely) and
    // ignores key order (Zod can reorder after a save+reload roundtrip).
    const baseline = {
      ...settings,
      loadProfile: withSeededStages(settings.loadProfile),
    }
    return (
      !isEqual(stripUndefined(plainActions), stripUndefined(actions)) ||
      !isEqual(stripUndefined(settingsState), stripUndefined(baseline))
    )
  }, [plainActions, actions, settingsState, settings])

  return {
    actions: actionState,
    plainActions,
    addAction,
    updateAction,
    removeAction,
    reorderActions,
    settings: settingsState,
    setLoadProfile,
    setThresholds,
    setLoadZones,
    isDirty,
  }
}
