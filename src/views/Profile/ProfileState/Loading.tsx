import { useEffect } from 'react'
import { SignedInState, SignedOutState } from './types'

interface LoadingStateProps {
  onLoaded: (state: SignedInState | SignedOutState) => void
}

export function Loading({ onLoaded }: LoadingStateProps) {
  useEffect(() => {
    window.studio.auth
      .getProfile()
      .then((profile) => {
        if (profile.type === 'anonymous') {
          onLoaded({
            type: 'signed-out',
          })

          return
        }

        onLoaded({
          type: 'signed-in',
          profile,
        })
      })
      .catch((error) => {
        console.log('Error getting profile', error)

        onLoaded({
          type: 'signed-out',
        })
      })
  }, [onLoaded])

  return <div></div>
}
