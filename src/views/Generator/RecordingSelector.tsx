import { Flex, IconButton, Select, Text, Tooltip } from '@radix-ui/themes'
import { ExclamationTriangleIcon, PlusIcon } from '@radix-ui/react-icons'
import { css } from '@emotion/react'

import { useGeneratorStore } from '@/store/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { useStudioUIStore } from '@/store/ui'
import { getFileNameWithoutExtension } from '@/utils/file'
import { useToast } from '@/store/ui/useToast'
import log from 'electron-log/renderer'

export function RecordingSelector() {
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
      const harFile = await window.studio.har.openFile(filePath)

      const proxyData = harToProxyData(harFile.content)
      setRecording(proxyData, harFile.name)
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
      <Text size="2" weight="medium" as="label" htmlFor="recording-selector">
        Recording
      </Text>
      <Select.Root value={recordingPath} onValueChange={handleOpen}>
        <Tooltip content="Switch between different recordings.">
          <Select.Trigger
            id="recording-selector"
            placeholder="Select recording"
            css={css`
              width: 300px;
              @media (max-width: 1060px) {
                width: 125px;
              }
            `}
          >
            <Flex as="span" align="center" gap="1">
              {isRecordingMissing && (
                <ExclamationTriangleIcon
                  color="orange"
                  css={{ minWidth: 16 }}
                />
              )}
              {getFileNameWithoutExtension(recordingPath)}
            </Flex>
          </Select.Trigger>
        </Tooltip>
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
      <Tooltip content="Import recording">
        <IconButton variant="ghost" color="gray" onClick={handleImport}>
          <PlusIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  )
}
