import { css } from '@emotion/react'
import { Flex, IconButton, Select, Text, Tooltip } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { AlertTriangleIcon, FolderOpenIcon } from 'lucide-react'
import * as pathe from 'pathe'

import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { getFileNameWithoutExtension } from '@/utils/file'

function displayNameFromPath(filePath: string) {
  return getFileNameWithoutExtension(pathe.basename(filePath))
}

export function RecordingSelector({
  compact = false,
  onChangeRecording,
}: {
  compact?: boolean
  onChangeRecording?: () => void
}) {
  const recordings = useStudioUIStore((store) => [...store.recordings.values()])
  const recordingPath = useGeneratorStore((store) => store.recordingPath)

  const setRecording = useGeneratorStore((store) => store.setRecording)
  const showToast = useToast()

  const selectedRecording = recordings.find(
    (recording) => recording.path === recordingPath
  )

  const isRecordingMissing =
    selectedRecording === undefined && recordingPath !== ''

  const handleOpen = async (filePath: string): Promise<boolean> => {
    try {
      const result = await window.studio.file.open(filePath)

      if (result.type !== 'recording') {
        throw new Error('Expected recording content')
      }

      setRecording(result.data.requests, filePath)
      onChangeRecording?.()
      return true
    } catch (error) {
      showToast({
        title: 'Failed to open recording',
        status: 'error',
      })
      log.error(error)
      return false
    }
  }

  const handlePickFromDisk = async () => {
    try {
      const filePath = await window.studio.file.pickOpenFile()

      if (filePath === null) {
        return
      }

      const opened = await handleOpen(filePath)

      if (opened) {
        window.studio.app.trackEvent({
          event: UsageEventName.RecordingImported,
        })
      }
    } catch (error) {
      showToast({
        title: 'Failed to open recording',
        status: 'error',
      })
      log.error(error)
    }
  }

  return (
    <Flex gap="2" align="center">
      {!compact && (
        <Text size="2" weight="medium" as="label" htmlFor="recording-selector">
          Recording
        </Text>
      )}
      <Select.Root value={recordingPath} onValueChange={handleOpen}>
        <Select.Trigger
          id="recording-selector"
          placeholder="Select recording"
          css={css`
            width: ${compact ? 'auto' : '300px'};
            @media (max-width: 1060px) {
              width: 125px;
            }
          `}
        >
          <Flex as="span" align="center" gap="1">
            {isRecordingMissing && (
              <AlertTriangleIcon
                css={css`
                  flex-shrink: 0;
                  color: var(--accent-9);
                `}
              />
            )}
            {displayNameFromPath(recordingPath)}
          </Flex>
        </Select.Trigger>
        <Select.Content position="popper">
          {isRecordingMissing && (
            <Select.Item value={recordingPath} disabled>
              {displayNameFromPath(recordingPath)}
            </Select.Item>
          )}
          {recordings.map((recording) => (
            <Select.Item value={recording.path} key={recording.path}>
              {recording.displayName}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Tooltip content="Open HAR from disk">
        <IconButton variant="ghost" color="gray" onClick={handlePickFromDisk}>
          <FolderOpenIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  )
}
