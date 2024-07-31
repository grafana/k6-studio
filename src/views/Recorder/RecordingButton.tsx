import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@radix-ui/themes'
import { PlayIcon, StopIcon } from '@radix-ui/react-icons'

import { startRecording, stopRecording } from './Recorder.utils'
import { useRecorderStore } from '@/store/recorder'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { groupProxyData } from '@/utils/groups'

export function RecordingControls() {
  const requests = useRecorderStore((state) => state.proxyData)
  const isRecording = useRecorderStore((state) => state.isRecording)
  const setIsRecording = useRecorderStore((state) => state.setIsRecording)
  const resetProxyData = useRecorderStore((state) => state.resetProxyData)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  async function handleStartRecording() {
    resetProxyData()
    setIsLoading(true)

    await startRecording()

    setIsLoading(false)
    setIsRecording(true)
  }

  async function handleStopRecording() {
    stopRecording()
    setIsRecording(false)

    if (requests.length > 0) {
      const grouped = groupProxyData(requests)
      const har = proxyDataToHar(grouped)
      const filePath = await window.studio.har.saveFile(
        JSON.stringify(har, null, 4)
      )

      navigate(`/recording-previewer/${encodeURIComponent(filePath)}`)
    }
  }

  return (
    <Button
      onClick={isRecording ? handleStopRecording : handleStartRecording}
      loading={isLoading}
      color={isRecording ? 'red' : 'green'}
    >
      {isRecording ? (
        <>
          <StopIcon /> Stop recording
        </>
      ) : (
        <>
          <PlayIcon /> Start recording
        </>
      )}
    </Button>
  )
}
