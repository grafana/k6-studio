import { EmptyMessage } from '@/components/EmptyMessage'
import { ProxyData } from '@/types'
import { GlobeIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import { ComponentProps } from 'react'

export function validateRecording({
  allowlist,
  requests,
  filteredRequests,
  recordingPath,
  recording,
  filter,
  setShowAllowlistDialog,
}: {
  allowlist: string[]
  requests: ProxyData[]
  filteredRequests: ProxyData[]
  recordingPath: string
  recording?: unknown
  filter: string
  setShowAllowlistDialog: (show: boolean) => void
}): {
  message: ComponentProps<typeof EmptyMessage>['message']
  illustration?: ComponentProps<typeof EmptyMessage>['illustration']
  action?: ComponentProps<typeof EmptyMessage>['action']
} | null {
  if (recording === undefined && recordingPath === '') {
    return {
      message: 'Select a recording from the top menu',
    }
  }

  if (recording === undefined && recordingPath !== '') {
    return {
      message:
        'The selected recording is missing, select another one from the top menu',
    }
  }

  if (requests.length === 0) {
    return {
      message:
        'The selected recording is empty, select another one from the top menu',
    }
  }

  if (allowlist.length === 0) {
    return {
      message: "Get started by selecting hosts you'd like to work on",
      action: (
        <Button onClick={() => setShowAllowlistDialog(true)}>
          <GlobeIcon />
          Select hosts
        </Button>
      ),
    }
  }

  if (filteredRequests.length === 0 && filter.trim() === '') {
    return {
      message:
        'Selected hosts generated only static requests, enable static assets or select different hosts',
      action: (
        <Button onClick={() => setShowAllowlistDialog(true)}>
          <GlobeIcon />
          Select hosts
        </Button>
      ),
    }
  }

  return null
}
