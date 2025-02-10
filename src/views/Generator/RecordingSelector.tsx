import { Flex, IconButton, Select, Text, Tooltip } from '@radix-ui/themes'
import { ExclamationTriangleIcon, PlusIcon } from '@radix-ui/react-icons'
import { css } from '@emotion/react'

import { useGeneratorStore } from '@/store/generator'
import { useStudioUIStore } from '@/store/ui'
import { getFileNameWithoutExtension } from '@/utils/file'
import { useToast } from '@/store/ui/useToast'
import log from 'electron-log/renderer'
import { useRecordingFile } from './Generator.hooks'
import { useEffect } from 'react'

export function RecordingSelector() {
  const recordings = useStudioUIStore((store) => [...store.recordings.values()])
  const recordingPath = useGeneratorStore((store) => store.recordingPath)

  const setRecordingPath = useGeneratorStore((store) => store.setRecordingPath)
  const setRecording = useGeneratorStore((store) => store.setRecording)
  const showToast = useToast()

  const { data } = useRecordingFile({
    fileName: recordingPath,
    onSuccess: (recording) => {
      setRecording(recording)
    },
    onError: () => {
      showToast({
        title: 'Failed to load recording',
        description: 'Select another recording in the sidebar.',
        status: 'error',
      })
    },
  })

  useEffect(() => {
    if (data) {
      setRecording(data)
    }
  }, [data, setRecording])

  const selectedRecording = recordings.find(
    (recording) => recording.fileName === recordingPath
  )

  const isRecordingMissing =
    selectedRecording === undefined && recordingPath !== ''

  const handleImport = async () => {
    try {
      const filePath = await window.studio.har.importFile()

      if (!filePath) return

      setRecordingPath(filePath)
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
      <Select.Root value={recordingPath} onValueChange={setRecordingPath}>
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
