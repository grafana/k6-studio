import { useEffect, useState } from 'react'
import { RunInCloudState } from './types'
import { RunInCloudStates } from './RunInCloudStates'

interface RunInCloudProps {
  scriptPath: string
  onClose: () => void
}

export function RunInCloud({ scriptPath }: RunInCloudProps) {
  const [state, setState] = useState<RunInCloudState>({
    type: 'initializing',
  })

  useEffect(() => {
    window.studio.cloud
      .run(scriptPath)
      .then((result) => {
        setState({
          type: 'started',
          testRunUrl: result.testRunUrl,
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }, [scriptPath])

  useEffect(() => {
    return window.studio.cloud.onStateChange(setState)
  }, [])

  return <RunInCloudStates state={state} onAbort={() => {}} />
}
