import { useEffect } from 'react'
import { SignedInState, SignedOutState, SigningInState } from './types'
import { Flex, Spinner } from '@radix-ui/themes'

interface SigningInStateProps {
  state: SigningInState
  onStateChange: (
    state: SignedInState | SigningInState | SignedOutState
  ) => void
}

export function SigningIn({ onStateChange }: SigningInStateProps) {
  useEffect(() => {
    setTimeout(() => {
      onStateChange({
        type: 'signed-in',
        user: {
          name: 'Johan',
          email: 'johan.allansson@grafana.com',
        },
      })
    }, 5000)
  }, [onStateChange])

  return (
    <Flex direction="column" align="center" gap="2">
      <Spinner />
      <div>Signing in...</div>
    </Flex>
  )
}
