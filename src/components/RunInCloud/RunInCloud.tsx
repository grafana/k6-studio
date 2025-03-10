import { useEffect, useRef, useState } from 'react'
import { RunInCloudState, RunInCloudStates } from './states'

interface RunInCloudProps {
  scriptPath: string
  onClose: () => void
}

export function RunInCloud({ scriptPath, onClose }: RunInCloudProps) {
  const onCloseRef = useRef(onClose)

  const [state, setState] = useState<RunInCloudState>({
    type: 'initializing',
  })

  useEffect(() => {
    // Remember the latest version of onClose so that we call it when
    // the run has finally started (which may be a long time and multiple
    // re-renders later if the user is not signed in).
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    window.studio.cloud
      .run(scriptPath)
      .then(() => {
        onCloseRef.current()
      })
      .catch((error) => {
        console.error(error)

        setState({
          type: 'error',
        })
      })
  }, [scriptPath])

  useEffect(() => {
    return window.studio.cloud.onStateChange(setState)
  }, [])

  return <RunInCloudStates state={state} onAbort={() => {}} />
}
