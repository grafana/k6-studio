import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Spinner } from '@radix-ui/themes'
import { PlayIcon, StopIcon } from '@radix-ui/react-icons'

import { startRecording, stopRecording } from './Recorder.utils'
import { useRecorderStore } from '@/store/recorder'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { useGeneratorStore } from '@/store/generator'
import { groupProxyData } from '@/utils/groups'
import { recordingToProxyData } from '@/utils/serializers/recording'

export function RecordingControls() {
  const requests = useRecorderStore((state) => state.proxyData)
  const isRecording = useRecorderStore((state) => state.isRecording)
  const setIsRecording = useRecorderStore((state) => state.setIsRecording)
  const resetProxyData = useRecorderStore((state) => state.resetProxyData)
  const isEmpty = useRecorderStore((state) => state.proxyData.length === 0)
  const setGeneratorRecording = useGeneratorStore((state) => state.setRecording)
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
    const grouped = groupProxyData(requests)
    const har = proxyDataToHar(grouped)
    window.studio.har.saveFile(JSON.stringify(har, null, 4))
  }

  function handleCreateTestGenerator() {
    const proxyData = recordingToProxyData(requests)

    setGeneratorRecording(proxyData, '', true)
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
