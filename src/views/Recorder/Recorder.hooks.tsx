import { Button } from '@radix-ui/themes'
import { SettingsIcon } from 'lucide-react'
import { useEffect } from 'react'

import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { exhaustive } from '@/utils/typescript'

export function useRecordingErrorToast() {
  const showToast = useToast()

  const openSettingsDialog = useStudioUIStore(
    (state) => state.openSettingsDialog
  )

  useEffect(() => {
    return window.studio.browser.onBrowserLaunchError((error) => {
      switch (error.reason) {
        case 'websocket-server-error':
          showToast({
            status: 'error',
            title: 'Failed to start recording',
            description:
              'An error occurred while initializing browser recording.',
            action: (
              <Button onClick={() => openSettingsDialog('logs')}>
                Open log file
              </Button>
            ),
          })
          break

        case 'browser-launch':
          showToast({
            status: 'error',
            title: 'Failed to launch browser',
            description: 'Please check your browser path and try again.',
            action: (
              <Button onClick={() => openSettingsDialog('recorder')}>
                <SettingsIcon />
                Open settings
              </Button>
            ),
          })
          break

        case 'extension-load':
          showToast({
            status: 'error',
            title: 'Failed to load extension',
            description:
              'Loading the browser extension failed. Browser recording will not be available.',
            action: (
              <Button onClick={() => openSettingsDialog('logs')}>
                Open log file
              </Button>
            ),
          })
          break

        case 'unknown':
          showToast({
            status: 'error',
            title: 'An unknown error occurred',
            description: 'An unknown error occurred during browser recording.',
            action: (
              <Button onClick={() => openSettingsDialog('logs')}>
                Open log file
              </Button>
            ),
          })

          break

        default:
          exhaustive(error.reason)
          break
      }
    })
  }, [openSettingsDialog, showToast])
}
