import { Allotment } from 'allotment'
import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'

import { generateFileNameWithTimestamp } from '@/utils/file'
import { View } from '@/components/Layout/View'
import { RequestsSection } from '@/views/Recorder/RequestsSection'
import { createNewGeneratorFile } from '@/utils/generator'
import { ProxyData } from '@/types'
import { harToProxyData } from '@/utils/harToProxyData'
import { getRoutePath } from '@/routeMap'
import { Details } from '@/components/WebLogView/Details'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'

export function RecordingPreviewer() {
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const { fileName } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDiscardable = searchParams.get('discardable') !== null
  invariant(fileName, 'fileName is required')
  useSetWindowTitle(fileName)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setProxyData([])
      const har = await window.studio.har.openFile(fileName)
      setIsLoading(false)

      invariant(har, 'Failed to open file')

      setProxyData(harToProxyData(har.content))
    })()

    return () => {
      setProxyData([])
    }
  }, [fileName, navigate])

  const handleDeleteRecording = async () => {
    await window.studio.ui.deleteFile(fileName)
    navigate(getRoutePath('home'))
  }

  const handleCreateTestGenerator = async () => {
    const newGenerator = createNewGeneratorFile(fileName)
    const generatorFileName = await window.studio.generator.saveGenerator(
      JSON.stringify(newGenerator, null, 2),
      generateFileNameWithTimestamp('json', 'Generator')
    )

    navigate(
      getRoutePath('generator', {
        fileName: encodeURIComponent(generatorFileName),
      })
    )
  }

  const handleDiscard = async () => {
    await window.studio.ui.deleteFile(fileName)
    navigate(`${getRoutePath('recorder')}?autoStart`)
  }

  return (
    <View
      title={`Recording - ${fileName}`}
      loading={isLoading}
      actions={
        <>
          {isDiscardable && (
            <Button onClick={handleDiscard} variant="outline" color="red">
              Discard and start over
            </Button>
          )}
          <Button onClick={handleCreateTestGenerator}>
            Create test generator
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="soft" aria-label="Actions">
                <DotsVerticalIcon />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item asChild>
                <Link to={getRoutePath('recorder')}>New recording</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item color="red" onClick={handleDeleteRecording}>
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </>
      }
    >
      <Allotment defaultSizes={[1, 1]}>
        <Allotment.Pane>
          <RequestsSection
            proxyData={proxyData}
            noRequestsMessage="The recording is empty"
            selectedRequestId={selectedRequest?.id}
            onSelectRequest={setSelectedRequest}
          />
        </Allotment.Pane>
        {selectedRequest !== null && (
          <Allotment.Pane minSize={300}>
            <Details
              selectedRequest={selectedRequest}
              onSelectRequest={setSelectedRequest}
            />
          </Allotment.Pane>
        )}
      </Allotment>
    </View>
  )
}
