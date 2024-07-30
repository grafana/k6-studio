import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@radix-ui/themes'
import { PlayIcon, StopIcon } from '@radix-ui/react-icons'

import { startRecording, stopRecording } from './Recorder.utils'
import { useRecorderStore } from '@/store/recorder'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import { groupProxyData } from '@/utils/groups'
import { createNewGeneratorFile } from '@/utils/generator'

export function RecordingControls() {
  const requests = useRecorderStore((state) => state.proxyData)
  const isRecording = useRecorderStore((state) => state.isRecording)
  const setIsRecording = useRecorderStore((state) => state.setIsRecording)
  const resetProxyData = useRecorderStore((state) => state.resetProxyData)
  const isEmpty = useRecorderStore((state) => state.proxyData.length === 0)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { path } = useParams()

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

      navigate(`/recorder/${encodeURIComponent(filePath)}`)
    }
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
    <>
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        loading={isLoading}
        color={isRecording ? 'red' : 'green'}
      >
        <Icon recording={isRecording} />
        {isRecording ? 'Stop recording' : 'Start recording'}
      </Button>
      {!isRecording && !isEmpty && (
        <Button onClick={handleCreateTestGenerator}>
          Create test generator
        </Button>
      )}
    </>
  )
}

function Icon({ recording }: { recording: boolean }) {
  if (recording) {
    return <StopIcon />
  }

  return <PlayIcon />
}
