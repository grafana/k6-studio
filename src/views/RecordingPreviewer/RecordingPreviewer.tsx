import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { emitScript } from '@/codegen/browser'
import { convertToTest } from '@/codegen/browser/test'
import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useCreateGenerator } from '@/hooks/useCreateGenerator'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { useSettings } from '@/hooks/useSettings'
import { getRoutePath } from '@/routeMap'
import { BrowserEvent } from '@/schemas/recording'
import { useToast } from '@/store/ui/useToast'
import { ProxyData, StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { harToProxyData } from '@/utils/harToProxyData'

import { RecordingInspector } from '../Recorder/RecordingInspector'
import { RequestLog } from '../Recorder/RequestLog'

export function RecordingPreviewer() {
  const { data: settings } = useSettings()

  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [browserEvents, setBrowserEvents] = useState<BrowserEvent[]>([])

  const showToast = useToast()

  const [isLoading, setIsLoading] = useState(true)
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
  const file: StudioFile = {
    fileName,
    displayName: getFileNameWithoutExtension(fileName),
    type: 'recording',
  }

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setProxyData([])
      const har = await window.studio.har.openFile(fileName)
      setIsLoading(false)

      invariant(har, 'Failed to open file')

      setProxyData(harToProxyData(har))
      setBrowserEvents(har.log._browserEvents ?? [])
    })()

    return () => {
      setProxyData([])
      setBrowserEvents([])
    }
  }, [fileName, navigate])

  const groups = useProxyDataGroups(proxyData)

  const handleCreateGenerator = () => createTestGenerator(fileName)

  const handleDeleteRecording = async () => {
    await window.studio.ui.deleteFile(file)
    navigate(getRoutePath('home'))
  }

  const handleDiscard = async () => {
    await window.studio.ui.deleteFile(file)
    navigate(getRoutePath('recorder'))
  }

  const handleExportBrowserScript = (fileName: string) => {
    const test = convertToTest({
      browserEvents,
    })

    emitScript(test)
      .then((script) => window.studio.script.saveScript(script, fileName))
      .then(() => {
        navigate(
          getRoutePath('validator', {
            fileName: encodeURIComponent(fileName),
          })
        )
      })
      .catch((err) => {
        console.error(err)

        showToast({
          title: 'Failed to export browser script.',
          status: 'error',
        })
      })
  }

  return (
    <View
      title="Recording"
      subTitle={<FileNameHeader file={file} />}
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
      {!isLoading && settings?.recorder.enableBrowserRecorder && (
        <RecordingInspector
          groups={groups}
          requests={proxyData}
          browserEvents={browserEvents}
          onExportBrowserScript={handleExportBrowserScript}
        />
      )}

      {!isLoading && !settings?.recorder.enableBrowserRecorder && (
        <RequestLog groups={groups} requests={proxyData} />
      )}
    </View>
  )
}
