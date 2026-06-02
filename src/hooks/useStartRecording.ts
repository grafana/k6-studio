import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { LaunchBrowserOptions } from '@/recorder/types'
import { getRoutePath } from '@/routeMap'

import { useRecentURLs } from './useRecentURLs'
import { useSyncedLocalStorage } from './useSyncedLocalStorage'

export interface StartRecordingNavigationState {
  autoStart?: LaunchBrowserOptions
  prefilledURL?: string
}

export function useStartRecording() {
  const { addURL } = useRecentURLs()
  const navigate = useNavigate()

  const [captureBrowser] = useSyncedLocalStorage(
    'start-recording.capture.browser',
    z.boolean(),
    true
  )

  return useCallback(
    (url: string) => {
      addURL(url)
      navigate(getRoutePath('recorder'), {
        state: {
          autoStart: { url, capture: { browser: captureBrowser } },
        } satisfies StartRecordingNavigationState,
      })
    },
    [addURL, navigate, captureBrowser]
  )
}
