import { useEffect, useRef, useState } from 'react'
import { useDeepCompareEffect } from 'react-use'

import { Script } from '@/handlers/cloud/types'

import { RunInCloudStates } from './states'
import { RunInCloudState } from './states/types'

interface RunInCloudContentProps {
  script: Script
  onClose: () => void
  onRunStarted?: () => void
}

export function RunInCloudContent({
  script,
  onClose,
  onRunStarted,
}: RunInCloudContentProps) {
  const onCloseRef = useRef(onClose)
  const onRunStartedRef = useRef(onRunStarted)

  const [state, setState] = useState<RunInCloudState>({
    type: 'initializing',
  })

  useEffect(() => {
    // Remember the latest version of the callbacks so that we call them when
    // the run has finally started (which may be a long time and multiple
    // re-renders later if the user is not signed in).
    onCloseRef.current = onClose
    onRunStartedRef.current = onRunStarted
  }, [onClose, onRunStarted])

  useDeepCompareEffect(() => {
    window.studio.cloud
      .run(script)
      .then((result) => {
        onCloseRef.current()

        if (result.type === 'started') {
          onRunStartedRef.current?.()
        }
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
