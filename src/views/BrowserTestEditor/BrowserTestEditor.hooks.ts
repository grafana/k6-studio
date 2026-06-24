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
  defaultBrowserTestOptions,
} from '@/schemas/browserTest'
import { StudioFile } from '@/types'
import { LoadProfileExecutorOptions } from '@/types/testOptions'
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

export function useBrowserTestState(
  browserTestFile: BrowserTestFile | undefined
) {
  const { actions = [], options = defaultBrowserTestOptions } =
    browserTestFile ?? {}

  const initialOptions: BrowserTestOptions = {
    ...options,
    loadProfile: withSeededStages(options.loadProfile),
  }

  const [test, setTest] = useState(() => ({
    actions,
    options: initialOptions,
  }))

  const [savedTest, setSavedTest] = useState(() => ({
    actions,
    options: initialOptions,
  }))

  const markAsSaved = useCallback(() => {
    setSavedTest(test)
  }, [test])

  const isDirty = useMemo(() => {
    // Baseline widens stages to match the in-memory state so seeded defaults
    // aren't seen as edits. Compare strips undefined keys (RHF emits cleared
    // inputs as `key: undefined`, while Zod parse drops them entirely) and
    // ignores key order (Zod can reorder after a save+reload roundtrip).
    const baseline = savedTest

    return (
      !isEqual(
        stripUndefined(test.actions),
        stripUndefined(baseline.actions)
      ) ||
      !isEqual(stripUndefined(test.options), stripUndefined(baseline.options))
    )
  }, [savedTest, test.actions, test.options])

  return {
    test,
    isDirty,
    setTest,
    markAsSaved,
  }
}
