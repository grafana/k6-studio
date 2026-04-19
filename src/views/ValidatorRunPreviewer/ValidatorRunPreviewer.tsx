import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import invariant from 'tiny-invariant'

import { FileNameHeader } from '@/components/FileNameHeader'
import { View } from '@/components/Layout/View'
import { useProxyDataGroups } from '@/hooks/useProxyDataGroups'
import { BrowserEvent } from '@/schemas/recording'
import { getRoutePath } from '@/routeMap'
import { useToast } from '@/store/ui/useToast'
import { ProxyData, StudioFile } from '@/types'
import { getFileNameWithoutExtension } from '@/utils/file'
import { harToProxyData } from '@/utils/harToProxyData'

import { RecordingInspector } from '../Recorder/RecordingInspector'

import { ValidatorRunPreviewerControls } from './ValidatorRunPreviewerControls'

export function ValidatorRunPreviewer() {
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const [browserEvents, setBrowserEvents] = useState<BrowserEvent[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const { fileName } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()

  invariant(fileName, 'fileName is required')
  const decoded = decodeURIComponent(fileName)
  const baseName = decoded.split(/[/\\]/).pop() ?? decoded
  const file: StudioFile = {
    fileName: decoded,
    displayName: getFileNameWithoutExtension(baseName),
    type: 'validator-run',
  }

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setProxyData([])
      try {
        const har = await window.studio.validatorRun.openFile(decoded)
        setIsLoading(false)

        invariant(har, 'Failed to open file')

        setProxyData(harToProxyData(har))
        setBrowserEvents(har.log._browserEvents?.events ?? [])
      } catch {
        showToast({
          title: 'Failed to load validator run',
          status: 'error',
        })
        navigate(getRoutePath('home'))
      }
    })()

    return () => {
      setProxyData([])
      setBrowserEvents([])
    }
  }, [decoded, navigate, showToast])

  const groups = useProxyDataGroups(proxyData)

  return (
    <View
      title="Validator run"
      subTitle={<FileNameHeader file={file} />}
      loading={isLoading}
      actions={<ValidatorRunPreviewerControls file={file} />}
    >
      {!isLoading && (
        <RecordingInspector
          groups={groups}
          requests={proxyData}
          browserEvents={browserEvents}
        />
      )}
    </View>
  )
}
