import { Button, DropdownMenu } from '@radix-ui/themes'

import { useGeneratorStore } from '@/store/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { useStudioUIStore } from '@/store/ui'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { getFileNameWithoutExtension } from '@/utils/file'

export function RecordingSelector() {
  const recordingPath = useGeneratorStore((store) => store.recordingPath)
  const setRecording = useGeneratorStore((store) => store.setRecording)
  const recordings = useStudioUIStore((store) => store.recordings)

  const handleOpen = async (filePath: string) => {
    const harFile = await window.studio.har.openFile(filePath)

    const proxyData = harToProxyData(harFile.content)
    setRecording(proxyData, harFile.name)
  }

  const handleImport = async () => {
    const filePath = await window.studio.har.importFile()

    if (!filePath) return

    await handleOpen(filePath)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" mr="2">
          {recordingPath
            ? getFileNameWithoutExtension(recordingPath)
            : 'Select recording'}
          <CaretDownIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.RadioGroup
          value={recordingPath}
          onValueChange={handleOpen}
        >
          {recordings.map((harFileName) => (
            <DropdownMenu.RadioItem value={harFileName} key={harFileName}>
              {getFileNameWithoutExtension(harFileName)}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={handleImport}>
          Import HAR file
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
