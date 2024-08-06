import { Button, Flex, IconButton, Popover, Text } from '@radix-ui/themes'
import { Link } from 'react-router-dom'

import { useGeneratorStore } from '@/store/generator'
import { getFileNameFromPath } from '@/utils/file'
import { harToProxyData } from '@/utils/harToProxyData'
import { CaretDownIcon } from '@radix-ui/react-icons'
import { useStudioUIStore } from '@/store/ui'
import { css } from '@emotion/react'
import { getRoutePath } from '@/routeMap'

// TODO: Improve accessibility and UX in general
export function RecordingSelector() {
  const recordingPath = useGeneratorStore((store) => store.recordingPath)
  const setRecording = useGeneratorStore((store) => store.setRecording)
  const displayedValue =
    getFileNameFromPath(recordingPath) || 'Select recording'
  const recordings = useStudioUIStore((store) => store.recordings)

  const handleOpen = async (filePath?: string) => {
    const harFile = await window.studio.har.openFile(filePath)
    if (!harFile) return

    const proxyData = harToProxyData(harFile.content)
    setRecording(proxyData, harFile.path)
  }

  return (
    <Flex align="center" gap="2">
      <Text size="2">{displayedValue}</Text>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton variant="outline">
            <CaretDownIcon />
          </IconButton>
        </Popover.Trigger>
        <Popover.Content size="1" align="end">
          <Flex direction="column" gap="2">
            {recordings.length === 0 ? (
              <Text size="2">You don{"'"}t have saved recordings</Text>
            ) : (
              <>
                {recordings.map((filePath) => (
                  <Button
                    key={filePath}
                    variant="ghost"
                    color={recordingPath === filePath ? 'violet' : 'gray'}
                    css={css`
                      justify-content: start;
                    `}
                    onClick={() => handleOpen(filePath)}
                  >
                    {getFileNameFromPath(filePath)}
                  </Button>
                ))}
              </>
            )}

            <Flex gap="2">
              <Popover.Close>
                <Button variant="outline" asChild>
                  <Link to={`${getRoutePath('recorder')}?autoStart`}>
                    Start recording
                  </Link>
                </Button>
              </Popover.Close>
              <Popover.Close>
                {/* TODO: should copy the imported file into the workspace */}
                <Button onClick={() => handleOpen()}>Import HAR</Button>
              </Popover.Close>
            </Flex>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  )
}
