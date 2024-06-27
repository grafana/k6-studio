import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Spinner } from '@radix-ui/themes'
import { PlayIcon, StopIcon } from '@radix-ui/react-icons'

import { startRecording, stopRecording } from './Recorder.utils'
import { useRecorderStore } from '@/hooks/useRecorderStore'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { GroupedProxyData } from '@/types'
import { useGeneratorStore } from '@/hooks/useGeneratorStore'

export function RecordingControls({
  requests,
}: {
  requests: GroupedProxyData
}) {
  const { isRecording, setIsRecording, resetProxyData } = useRecorderStore()
  const isEmpty = Object.keys(requests).length === 0
  const { setRecording } = useGeneratorStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  function handleStartRecording() {
    resetProxyData()
    setIsLoading(true)
    startRecording().then(() => {
      setIsLoading(false)
      setIsRecording(true)
    })
  }

  function handleStopRecording() {
    stopRecording()
    setIsRecording(false)
  }

  function handleSave() {
    const har = proxyDataToHar(requests)
    window.studio.har.saveFile(JSON.stringify(har, null, 4))
  }

  function handleCreateTestGenerator() {
    setRecording(requests)
    navigate('/generator')
  }

  return (
    <>
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={isLoading}
        color={isRecording ? 'red' : 'green'}
      >
        <Icon recording={isRecording} loading={isLoading} />
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      {!isRecording && !isEmpty && (
        <>
          <Button onClick={handleSave}>Save to HAR</Button>
          <Button onClick={handleCreateTestGenerator}>
            Create Test Generator
          </Button>
        </>
      )}
    </>
  )
}

function Icon({
  recording,
  loading,
}: {
  recording: boolean
  loading: boolean
}) {
  if (loading) {
    return <Spinner />
  }

  if (recording) {
    return <StopIcon />
  }

  return <PlayIcon />
}
