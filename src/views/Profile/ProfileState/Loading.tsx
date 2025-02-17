import { useEffect } from 'react'
import { SignedInState, SignedOutState } from './types'

interface LoadingStateProps {
  onLoaded: (state: SignedInState | SignedOutState) => void
}

export function Loading({ onLoaded }: LoadingStateProps) {
  useEffect(() => {
    // TODO: fetch profile
    onLoaded({
      type: 'signed-out',
    })
  }, [onLoaded])

  return <div></div>
}
