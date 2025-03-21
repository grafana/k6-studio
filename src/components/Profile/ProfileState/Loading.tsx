import { useEffect } from 'react'

import { SignedInState, SignedOutState } from './types'

interface LoadingStateProps {
  onLoaded: (state: SignedInState | SignedOutState) => void
}

export function Loading({ onLoaded }: LoadingStateProps) {
  useEffect(() => {
    window.studio.auth
      .getProfiles()
      .then((profiles) => {
        const current = profiles.stacks[profiles.currentStack]

        if (!current) {
          onLoaded({
            type: 'signed-out',
          })

          return
        }

        onLoaded({
          type: 'signed-in',
          current,
          profiles,
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
