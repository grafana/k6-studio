import { exhaustive } from '@/utils/typescript'
import { LoadingMessage } from '../Profile/LoadingMessage'
import { SignInState } from './SignInState'
import { RunInCloudState } from './types'
import { Started } from './StartedState'

interface RunInCloudStatesProps {
  state: RunInCloudState
  onAbort: () => void
}

export function RunInCloudStates({ state }: RunInCloudStatesProps) {
  switch (state.type) {
    case 'initializing':
      return <LoadingMessage>Initializing...</LoadingMessage>

    case 'sign-in':
      return <SignInState />

    case 'preparing':
      return <LoadingMessage>Preparing...</LoadingMessage>

    case 'uploading':
      return <LoadingMessage>Uploading...</LoadingMessage>

    case 'starting':
      return <LoadingMessage>Starting...</LoadingMessage>

    case 'started':
      return <Started state={state} />

    default:
      return exhaustive(state)
  }
}
