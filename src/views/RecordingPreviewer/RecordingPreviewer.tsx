import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import invariant from 'tiny-invariant'

import {
  generateFileNameWithTimestamp,
  getFileNameWithoutExtension,
} from '@/utils/file'
import { View } from '@/components/Layout/View'
import { createNewGeneratorFile } from '@/utils/generator'
import { ProxyData } from '@/types'
import { harToProxyData } from '@/utils/harToProxyData'
import { getRoutePath } from '@/routeMap'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { RequestLog } from '../Recorder/RequestLog'

export function RecordingPreviewer() {
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { fileName } = useParams()
  const navigate = useNavigate()
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

      setProxyData(harToProxyData(har.content))
    })()

    return () => {
      setProxyData([])
    }
  }, [fileName, navigate])

  const groups = useProxyDataGroups(proxyData)

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

          <Button onClick={handleCreateTestGenerator}>
            Create test generator
          </Button>
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
      <RequestLog groups={groups} requests={proxyData} />
    </View>
  )
}
