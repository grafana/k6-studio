import { css } from '@emotion/react'
import { Flex, IconButton, Select, Text, Tooltip } from '@radix-ui/themes'
import log from 'electron-log/renderer'
import { AlertTriangleIcon, PlusIcon } from 'lucide-react'

import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { useToast } from '@/store/ui/useToast'
import { harToProxyData } from '@/utils/harToProxyData'
import * as path from '@/utils/path'

export function RecordingSelector({
  compact = false,
  onChangeRecording,
}: {
  compact?: boolean
  onChangeRecording?: () => void
}) {
  const recordings = useStudioUIStore((store) => store.recordings)
  const recordingPath = useGeneratorStore((store) => store.recordingPath)

  const setRecording = useGeneratorStore((store) => store.setRecording)
  const showToast = useToast()

  const selectedRecording = recordings.get(path.key(recordingPath))
  const isRecordingMissing =
    selectedRecording === undefined && recordingPath !== ''

  const handleOpen = async (filePath: string) => {
    try {
      const content = await window.studio.fs.openFile(filePath)

      if (content.type !== 'recording') {
        throw new Error(`Expected recording content, got ${content.type}`)
      }

      const proxyData = harToProxyData(content.data)
      setRecording(proxyData, filePath)
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
            {path.name(recordingPath)}
          </Flex>
        </Select.Trigger>
        <Select.Content position="popper">
          {isRecordingMissing && (
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
