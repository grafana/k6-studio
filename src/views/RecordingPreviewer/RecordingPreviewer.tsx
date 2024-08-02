import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'

import { getFileNameFromPath } from '@/utils/file'
import { View } from '@/components/Layout/View'
import { RequestsSection } from '@/views/Recorder/RequestsSection'
import { createNewGeneratorFile } from '@/utils/generator'
import { GroupedProxyData } from '@/types'
import { harToProxyData } from '@/utils/harToProxyData'
import { groupProxyData } from '@/utils/groups'

export function RecordingPreviewer() {
  const [groupedProxyData, setGroupedProxyData] = useState<GroupedProxyData>({})
  const [isLoading, setIsLoading] = useState(false)
  const { path } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDiscardable = searchParams.get('discardable') !== null
  invariant(path, 'Path is required')

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setGroupedProxyData({})
      const har = await window.studio.har.openFile(path)
      setIsLoading(false)

      invariant(har, 'Failed to open file')

      setGroupedProxyData(groupProxyData(harToProxyData(har.content)))
    })()

    return () => {
      setGroupedProxyData({})
    }
  }, [path, navigate])

  const handleDeleteRecording = async () => {
    await window.studio.ui.deleteFile(path)
    navigate('/')
  }

  const handleCreateTestGenerator = async () => {
    const newGenerator = createNewGeneratorFile(path)
    const generatorPath = await window.studio.generator.saveGenerator(
      JSON.stringify(newGenerator, null, 2),
      `${new Date().toISOString()}.json`
    )

    navigate(`/generator/${encodeURIComponent(generatorPath)}`)
  }

  const handleDiscard = async () => {
    await window.studio.ui.deleteFile(path)
    navigate('/recorder?autoStart')
  }

  return (
    <View
      title={`Recording - ${getFileNameFromPath(path)}`}
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
                <Link to="/recorder">New recording</Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item color="red" onClick={handleDeleteRecording}>
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </>
      }
    >
      <RequestsSection
        groupedProxyData={groupedProxyData}
        noRequestsMessage="The recording is empty"
      />
    </View>
  )
}
