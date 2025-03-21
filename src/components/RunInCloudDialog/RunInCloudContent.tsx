import { useEffect, useRef, useState } from 'react'
import { useDeepCompareEffect } from 'react-use'

import { Script } from '@/handlers/cloud/types'

import { RunInCloudStates } from './states'
import { RunInCloudState } from './states/types'

interface RunInCloudContentProps {
  script: Script
  onClose: () => void
}

export function RunInCloudContent({ script, onClose }: RunInCloudContentProps) {
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

  useDeepCompareEffect(() => {
    window.studio.cloud
      .run(script)
      .then(() => {
        onCloseRef.current()
      })
      .catch((error) => {
        console.error(error)
        setState({
          type: 'error',
        })
      })
  }, [script])

  useEffect(() => {
    return window.studio.cloud.onStateChange(setState)
  }, [])

  return <RunInCloudStates state={state} onAbort={() => {}} />
}
