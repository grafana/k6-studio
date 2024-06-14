import { useState } from 'react'
import { Button, Spinner } from '@radix-ui/themes'
import { PlayIcon, StopIcon } from '@radix-ui/react-icons'
import { startRecording, stopRecording } from './Recorder.utils'

export function RecordingButton({
  onStop,
  onStart,
}: {
  onStop?: () => void
  onStart?: () => void
}) {
  const [recording, setRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function handleStartRecording() {
    onStart?.()
    setIsLoading(true)
    startRecording().then(() => {
      setIsLoading(false)
      setRecording(true)
    })
  }

  function handleStopRecording() {
    stopRecording()
    setRecording(false)
    onStop?.()
  }

  return (
    <Button
      onClick={recording ? handleStopRecording : handleStartRecording}
      disabled={isLoading}
      color={recording ? 'red' : 'green'}
    >
      <Icon recording={recording} loading={isLoading} />
      {recording ? 'Stop Recording' : 'Start Recording'}
    </Button>
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
