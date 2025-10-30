import { mkdir, mkdtemp, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'

import { getProxyArguments } from '@/main/proxy'
import { AppSettings } from '@/types/settings'
import { getBrowserPath } from '@/utils/browser'

const CHROME_DEV_PREFERENCES = JSON.stringify({
  devtools: {
    preferences: {
      currentDockState: '"undocked"',
      'navigator-view-selected-tab': '"navigator-content-scripts"',
      'panel-selected-tab': '"sources"',
    },
    synced_preferences_sync_disabled: {
      // This allows content scripts to be debugged via DevTools without
      // having to whitelist them yourself.
      'skip-content-scripts': 'false',
    },
  },
})

const createUserDataDir = async () => {
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), 'k6-studio-'))

  // If we're in development mode, we create a default Chrome profile
  // with some preferences that make developing the extension easier
  // (e.g. whitelisting content scripts in the debugger).
  //
  // @ts-expect-error - Electron apps are built as CJS.
  if (import.meta.env.DEV) {
    try {
      const defaultProfilePath = path.join(userDataDir, 'Default')
      const preferencesPath = path.join(defaultProfilePath, 'Preferences')

      await mkdir(defaultProfilePath, { recursive: true })
      await writeFile(preferencesPath, CHROME_DEV_PREFERENCES, 'utf8')
    } catch (error) {
      console.error('Error creating Chrome profile:', error)
    }
  }

  return userDataDir
}

const FEATURES_TO_DISABLE = [
  'OptimizationGuideModelDownloading',
  'OptimizationHintsFetching',
  'OptimizationTargetPrediction',
  'OptimizationHints',
]

interface GetBrowserLaunchArgsOptions {
  url?: string
  settings: AppSettings
  args?: string[]
}

export async function getBrowserLaunchArgs({
  url,
  settings,
  args: additionalArgs = [],
}: GetBrowserLaunchArgsOptions) {
  const path = await getBrowserPath(settings.recorder)
  const userDataDir = await createUserDataDir()

  const proxyArgs = await getProxyArguments(settings.proxy)

  const args = [
    '--new',
    '--args',
    `--user-data-dir=${userDataDir}`,
    '--hide-crash-restore-bubble',
    '--test-type',
    '--no-default-browser-check',
    '--no-first-run',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-search-engine-choice-screen',
    `--disable-features=${FEATURES_TO_DISABLE.join(',')}`,
    ...proxyArgs,
    ...additionalArgs,
    url?.trim() || 'about:blank',
  ]

  return {
    path,
    args,
  }
}
