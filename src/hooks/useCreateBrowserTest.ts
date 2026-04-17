import log from 'electron-log/renderer'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { convertEventsToActions } from '@/codegen/browser/convertEventsToActions'
import { getRoutePath } from '@/routeMap'
import { BrowserEvent } from '@/schemas/recording'
import { useToast } from '@/store/ui/useToast'

export function useCreateBrowserTest() {
  const showToast = useToast()
  const navigate = useNavigate()

  return useCallback(
    async (browserEvents: BrowserEvent[] = []) => {
      try {
        const actions = convertEventsToActions(browserEvents)
        const fileName = await window.studio.browserTest.create({
          version: '1.0',
          actions,
        })

        navigate(
          getRoutePath('browserTestEditor', {
            fileName: encodeURIComponent(fileName),
          })
        )
      } catch (error) {
        log.error(error)
        showToast({
          status: 'error',
          title: 'Failed to create browser test',
        })
      }
    },
    [navigate, showToast]
  )
}
