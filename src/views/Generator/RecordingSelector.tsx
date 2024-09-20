import { Button, Flex, Select, Text } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'
import { css } from '@emotion/react'

import { useGeneratorStore } from '@/store/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { useStudioUIStore } from '@/store/ui'
import { getFileNameWithoutExtension } from '@/utils/file'
import { useToast } from '@/store/ui/useToast'

export function RecordingSelector() {
  const recordingPath = useGeneratorStore((store) => store.recordingPath)
  const setRecording = useGeneratorStore((store) => store.setRecording)
  const recordings = useStudioUIStore((store) => store.recordings)
  const showToast = useToast()

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
    }
  }

  return (
    <Flex gap="2" align="center">
      <Text size="2">Recording</Text>
      <Select.Root value={recordingPath} onValueChange={handleOpen}>
        <Select.Trigger
          placeholder="Select recording"
          css={css`
            max-width: 200px;
          `}
        />
        <Select.Content>
          {recordings.map((harFileName) => (
            <Select.Item value={harFileName} key={harFileName}>
              {getFileNameWithoutExtension(harFileName)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Button variant="ghost" color="gray" onClick={handleImport}>
        <PlusIcon />
        Import
      </Button>
    </Flex>
  )
}
