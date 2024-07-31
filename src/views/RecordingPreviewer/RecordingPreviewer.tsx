import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { getFileNameFromPath } from '@/utils/file'
import { View } from '@/components/Layout/View'
import { RequestsSection } from '@/views/Recorder/RequestsSection'
import { createNewGeneratorFile } from '@/utils/generator'
import { GroupedProxyData } from '@/types'
import { harToProxyData } from '@/utils/harToProxyData'
import { groupProxyData } from '@/utils/groups'
import { DotsVerticalIcon } from '@radix-ui/react-icons'

export function RecordingPreviewer() {
  const [groupedProxyData, setGroupedProxyData] = useState<GroupedProxyData>({})
  const [isLoading, setIsLoading] = useState(false)
  const { path } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!path) {
      navigate('/')
      return
    }

    ;(async () => {
      setIsLoading(true)
      setGroupedProxyData({})
      const har = await window.studio.har.openFile(path)
      setIsLoading(false)

      if (!har) {
        return
      }

      setGroupedProxyData(groupProxyData(harToProxyData(har.content)))
    })()

    return () => {
      setGroupedProxyData({})
    }
  }, [path, navigate])

  async function handleDeleteRecording() {
    if (!path) {
      return
    }

    await window.studio.har.deleteFile(path)
    navigate('/')
  }

  async function handleCreateTestGenerator() {
    if (!path) {
      return
    }

    const newGenerator = createNewGeneratorFile(path)
    const generatorPath = await window.studio.generator.saveGenerator(
      JSON.stringify(newGenerator, null, 2),
      `${new Date().toISOString()}.json`
    )

    navigate(`/generator/${encodeURIComponent(generatorPath)}`)
  }

  return (
    <View
      title={`Recording - ${getFileNameFromPath(path ?? '')}`}
      loading={isLoading}
      actions={
        <>
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
