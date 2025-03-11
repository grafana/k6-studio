import { exhaustive } from '@/utils/typescript'
import { SignIn } from './SignIn'
import { RunInCloudState } from './types'
import { Error } from './Error'
import { LoadingMessage } from '@/components/Profile/LoadingMessage'

interface RunInCloudStatesProps {
  state: RunInCloudState
  onAbort: () => void
}

export function RunInCloudStates({ state }: RunInCloudStatesProps) {
  switch (state.type) {
    case 'initializing':
      return <LoadingMessage>Initializing...</LoadingMessage>

    case 'sign-in':
      return <SignIn />

    case 'preparing':
    case 'uploading':
    case 'starting':
    case 'started':
      return <LoadingMessage>Uploading...</LoadingMessage>

    case 'error':
      return <Error state={state} />

    default:
      return exhaustive(state)
  }
}
