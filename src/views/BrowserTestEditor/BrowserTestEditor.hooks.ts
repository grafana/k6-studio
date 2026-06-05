import { arrayMove } from '@dnd-kit/sortable'
import { debounce, isEqual } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { emitScript } from '@/codegen/browser'
import { convertActionsToTest } from '@/codegen/browser/test'
import {
  useDefaultLayout,
  usePanelCallbackRef,
} from '@/components/primitives/ResizablePanel'
import {
  AnyBrowserAction,
  BrowserTestFile,
  BrowserTestOptions,
  BrowserThreshold,
} from '@/schemas/browserTest'
import { StudioFile } from '@/types'
import { LoadProfileExecutorOptions, LoadZoneData } from '@/types/testOptions'
import { getInitialStages } from '@/utils/generator'
import { stripUndefined } from '@/utils/object'

import { useDebugSession } from '../Validator/Validator.hooks'

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
  browserActions: AnyBrowserAction[],
  options?: BrowserTestOptions,
  trace = false
) {
  const [preview, setPreview] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const generatePreview = useCallback(
    debounce(
      async (
        actions: AnyBrowserAction[],
        currentOptions: BrowserTestOptions | undefined,
        trace: boolean
      ) => {
        try {
          const test = convertActionsToTest({
            browserActions: actions,
            options: currentOptions,
            trace,
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
    void generatePreview(browserActions, options, trace)

    return () => generatePreview.cancel()
  }, [browserActions, options, trace, generatePreview])

  return preview
}

interface UseBrowserTestValidatorOptions {
  file: StudioFile
  actions: AnyBrowserAction[]
  options?: BrowserTestOptions
}

export function useBrowserTestValidator({
  file,
  actions,
  options,
}: UseBrowserTestValidatorOptions) {
  const [shutdownDelay, setShutdownDelay] = useState(3000)

  // We add a timeout to the end of the script to give the page time to load the page, so that
  // there's something that the user can interact with. If we don't do this, k6 will stop before
  // any DOM mutations have been recorded.
  const actionsWithTimeout: AnyBrowserAction[] = useMemo(
    () => [
      ...actions,
      {
        id: '_validator_timeout_',
        method: 'page.waitForTimeout',
        timeout: isNaN(shutdownDelay) ? 3000 : shutdownDelay,
      },
    ],
    [actions, shutdownDelay]
  )

  const script = useBrowserScriptPreview(actionsWithTimeout, options, true)
  const session = useDebugSession({
    type: 'raw',
    content: script,
    name: file.fileName,
  })

  return {
    ...session,
    shutdownDelay,
    setShutdownDelay,
  }
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

export function useBrowserTestState({ actions, options }: BrowserTestFile) {
  const initialOptions: BrowserTestOptions = {
    ...options,
    loadProfile: withSeededStages(options.loadProfile),
  }

  const [actionState, setActionState] = useState(actions)
  const [optionsState, setOptionsState] =
    useState<BrowserTestOptions>(initialOptions)

  const [savedActions, setSavedActions] = useState(actions)
  const [savedOptions, setSavedOptions] =
    useState<BrowserTestOptions>(initialOptions)

  const addAction = (action: AnyBrowserAction) => {
    setActionState([...actionState, action])
  }

  const updateAction = (updatedAction: AnyBrowserAction) => {
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
      setOptionsState((prev) => ({
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
      setOptionsState((prev) => ({ ...prev, thresholds })),
    []
  )

  const setLoadZones = useCallback(
    (loadZones: LoadZoneData) =>
      setOptionsState((prev) => ({ ...prev, cloud: { loadZones } })),
    []
  )

  const markAsSaved = useCallback(() => {
    setSavedActions(actionState)
    setSavedOptions(optionsState)
  }, [actionState, optionsState])

  const isDirty = useMemo(() => {
    return (
      !isEqual(stripUndefined(actionState), stripUndefined(savedActions)) ||
      !isEqual(stripUndefined(optionsState), stripUndefined(savedOptions))
    )
  }, [actionState, savedActions, optionsState, savedOptions])

  return {
    actions: actionState,
    addAction,
    updateAction,
    removeAction,
    reorderActions,
    options: optionsState,
    setLoadProfile,
    setThresholds,
    setLoadZones,
    isDirty,
    markAsSaved,
  }
}
