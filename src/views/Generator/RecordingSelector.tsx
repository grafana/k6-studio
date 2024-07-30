import { useGeneratorStore } from '@/store/generator'
import { getFileNameFromPath } from '@/utils/file'
import { harToProxyData } from '@/utils/harToProxyData'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { Button, Flex, IconButton, Popover, Text } from '@radix-ui/themes'
import { Link } from 'react-router-dom'

export function RecordingSelector() {
  const recordingPath = useGeneratorStore((store) => store.recordingPath)
  const setRecording = useGeneratorStore((store) => store.setRecording)
  const fileName = getFileNameFromPath(recordingPath)

  const handleImport = async () => {
    const harFile = await window.studio.har.openFile()
    if (!harFile) return

    const proxyData = harToProxyData(harFile.content)
    setRecording(proxyData, harFile.path, true)
  }

  return (
    <Flex align="center" gap="2">
      <Text>{fileName || 'Select recording'}</Text>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton variant="outline">
            <CaretDownIcon />
          </IconButton>
        </Popover.Trigger>
        <Popover.Content size="1" align="end">
          <Flex direction="column" gap="2">
            <Text>You don{"'"}t have saved recordings</Text>
            <Flex gap="2">
              <Popover.Close>
                <Button variant="outline" asChild>
                  <Link to="/recorder">Start recording</Link>
                </Button>
              </Popover.Close>
              <Popover.Close>
                <Button onClick={handleImport}>Import HAR</Button>
              </Popover.Close>
            </Flex>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  )
}
