import { css } from '@emotion/react'
import { Flex, IconButton, Select, Text, Tooltip } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { AlertTriangleIcon, PlusIcon } from 'lucide-react'

import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { getFileNameWithoutExtension } from '@/utils/file'

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
    (recording) => recording.fileName === recordingPath
  )

  const isRecordingMissing =
    selectedRecording === undefined && recordingPath !== ''

  const handleOpen = async (filePath: string) => {
    try {
      const requests = await window.studio.files
        .open(filePath, 'recording')
        .then((file) => {
          if (file === null) {
            throw new Error('No file returned')
          }

          if (file.content.type !== 'recording') {
            throw new Error(
              `Expected recording file but got ${file.content.type}`
            )
          }
          return file.content.requests
        })

      setRecording(requests, filePath)
      onChangeRecording?.()
    } catch (error) {
      showToast({
        title: 'Failed to open recording',
        status: 'error',
      })
      log.error(error)
    }
  }

  const handleImport = async () => {
    try {
      const filePath = await window.studio.har.importFile()

      if (!filePath) return

      await handleOpen(filePath)
    } catch (error) {
      showToast({
        title: 'Failed to import recording',
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
            {getFileNameWithoutExtension(recordingPath)}
          </Flex>
        </Select.Trigger>
        <Select.Content position="popper">
          {isRecordingMissing && (
            <Select.Item value={recordingPath} disabled>
              {getFileNameWithoutExtension(recordingPath)}
            </Select.Item>
          )}
          {recordings.map((recording) => (
            <Select.Item value={recording.fileName} key={recording.fileName}>
              {recording.displayName}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      {!compact && (
        <Tooltip content="Import recording">
          <IconButton variant="ghost" color="gray" onClick={handleImport}>
            <PlusIcon />
          </IconButton>
        </Tooltip>
      )}
    </Flex>
  )
}
