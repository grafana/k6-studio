import { Button } from '@radix-ui/themes'
import { GlobeIcon } from 'lucide-react'
import { ComponentProps } from 'react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { ProxyData } from '@/types'

import { RecordingSelector } from '../../RecordingSelector'

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
      message: 'Select a recording from the dropdown',
      action: <RecordingSelector compact />,
    }
  }

  if (recording === undefined && recordingPath !== '') {
    return {
      message:
        'The selected recording is missing, select another one from the dropdown',
      action: <RecordingSelector compact />,
    }
  }

  if (requests.length === 0) {
    return {
      message:
        'The selected recording is empty, select another one from the dropdown',
      action: <RecordingSelector compact />,
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
