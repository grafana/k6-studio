import { css } from '@emotion/react'
import { Flex, IconButton, Select, Tooltip, Text } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { AlertTriangleIcon, FolderOpenIcon } from 'lucide-react'

import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import * as path from '@/utils/path'

interface RecordingSelectorProps {
  id?: string
  compact?: boolean
  error?: boolean
  onChangeRecording: (newPath: string) => void
}

export function RecordingSelector({
  id,
  error = false,
  onChangeRecording,
}: RecordingSelectorProps) {
  const showToast = useToast()

  const recordings = useStudioUIStore((store) => store.recordings)
  const recordingPath = useGeneratorStore((store) => store.recordingPath)

  const isKnownRecording = recordingPath !== '' && recordings.has(recordingPath)

  const handleOpen = async () => {
    try {
      const filePath = await window.studio.fs.showOpenDialog([
        { name: 'HAR', extensions: ['har'] },
      ])

      if (!filePath) {
        return
      }

      onChangeRecording?.(filePath)
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
      <Select.Root value={recordingPath} onValueChange={onChangeRecording}>
        <Tooltip
          content={<Text wrap="nowrap">{recordingPath}</Text>}
          hidden={recordingPath === ''}
          delayDuration={1000}
        >
          <Select.Trigger
            id={id}
            placeholder="Select recording"
            css={css`
              @media (max-width: 1060px) {
                width: 125px;
              }
            `}
          >
            <Flex as="span" align="center" gap="1">
              {error && (
                <AlertTriangleIcon
                  css={css`
                    flex-shrink: 0;
                    color: var(--accent-9);
                  `}
                />
              )}
              {path.name(recordingPath)}
            </Flex>
          </Select.Trigger>
        </Tooltip>
        <Select.Content position="popper">
          {!isKnownRecording && (
            <Select.Item value={recordingPath} disabled>
              {path.name(recordingPath)}
            </Select.Item>
          )}
          {Array.from(recordings.values()).map((recording) => (
            <Select.Item value={recording.path} key={recording.path}>
              {recording.displayName}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Tooltip content="Open recording">
        <IconButton variant="ghost" color="gray" onClick={handleOpen}>
          <FolderOpenIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  )
}
