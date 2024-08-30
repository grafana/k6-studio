import { Button, Flex, IconButton, Popover, Text } from '@radix-ui/themes'
import { Link } from 'react-router-dom'
import { css } from '@emotion/react'
import { CaretDownIcon } from '@radix-ui/react-icons'

import { useGeneratorStore } from '@/store/generator'
import { harToProxyData } from '@/utils/harToProxyData'
import { useStudioUIStore } from '@/store/ui'
import { getRoutePath } from '@/routeMap'

// TODO: Improve accessibility and UX in general
export function RecordingSelector() {
  const recordingPath = useGeneratorStore((store) => store.recordingPath)
  const setRecording = useGeneratorStore((store) => store.setRecording)
  const displayedValue = recordingPath || 'Select recording'
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
                {recordings.map((harFileName) => (
                  <Button
                    key={harFileName}
                    variant="ghost"
                    color={recordingPath === harFileName ? 'orange' : 'gray'}
                    css={css`
                      justify-content: start;
                    `}
                    onClick={() => handleOpen(harFileName)}
                  >
                    {harFileName}
                  </Button>
                ))}
              </>
            )}

            <Flex gap="2">
              <Popover.Close>
                <Button variant="outline" asChild>
                  <Link
                    to={getRoutePath('recorder')}
                    state={{ autoStart: true }}
                  >
                    Start recording
                  </Link>
                </Button>
              </Popover.Close>
              <Popover.Close>
                <Button onClick={() => handleImport()}>Import HAR</Button>
              </Popover.Close>
            </Flex>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  )
}
