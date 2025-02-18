import { Allotment } from 'allotment'
import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'

import { getFileNameWithoutExtension } from '@/utils/file'
import { View } from '@/components/Layout/View'
import { RequestsSection } from '@/views/Recorder/RequestsSection'
import { ProxyData } from '@/types'
import { harToProxyData } from '@/utils/harToProxyData'
import { getRoutePath } from '@/routeMap'
import { Details } from '@/components/WebLogView/Details'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { EmptyMessage } from '@/components/EmptyMessage'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'

export function RecordingPreviewer() {
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ProxyData | null>(null)
  const { fileName } = useParams()
  const navigate = useNavigate()
  const createTestGenerator = useCreateGenerator()
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { state } = useLocation()
  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const isDiscardable = Boolean(state?.discardable)
  invariant(fileName, 'fileName is required')

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setProxyData([])
      const har = await window.studio.har.openFile(fileName)
      setIsLoading(false)

      invariant(har, 'Failed to open file')

      setProxyData(harToProxyData(har))
    })()

    return () => {
      setProxyData([])
    }
  }, [fileName, navigate])

  const groups = useProxyDataGroups(proxyData)

  const handleCreateGenerator = () => createTestGenerator(fileName)

  const handleDeleteRecording = async () => {
    await window.studio.ui.deleteFile({
      type: 'recording',
      fileName,
      displayName: getFileNameWithoutExtension(fileName),
    })
    navigate(getRoutePath('home'))
  }

  const handleDiscard = async () => {
    await window.studio.ui.deleteFile({
      type: 'recording',
      fileName,
      displayName: getFileNameWithoutExtension(fileName),
    })
    navigate(getRoutePath('recorder'))
  }

  return (
    <View
      title="Recording"
      subTitle={getFileNameWithoutExtension(fileName)}
      loading={isLoading}
      actions={
        <>
          {isDiscardable && (
            <Button onClick={handleDiscard} variant="outline" color="red">
              Discard
            </Button>
          )}

          {!isDiscardable && (
            <Button variant="outline" asChild css={{ cursor: 'default' }}>
              <Link to={getRoutePath('recorder')}>New recording</Link>
            </Button>
          )}

          <Button onClick={handleCreateGenerator}>Create test generator</Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" aria-label="Actions" color="gray">
                <DotsVerticalIcon />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
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
            groups={groups}
            proxyData={proxyData}
            noDataElement={<EmptyMessage message="The recording is empty" />}
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
