import { exhaustive } from '@/utils/typescript'

import { Error } from './Error'
import { Loading } from './Loading'
import { SignIn } from './SignIn'
import { RunInCloudState } from './types'

interface RunInCloudStatesProps {
  state: RunInCloudState
  onAbort: () => void
}

export function RunInCloudStates({ state }: RunInCloudStatesProps) {
  switch (state.type) {
    case 'initializing':
      return <Loading>Initializing...</Loading>

    case 'sign-in':
      return <SignIn />

    case 'preparing':
    case 'uploading':
    case 'starting':
    case 'started':
      return <Loading>Uploading test...</Loading>

    case 'error':
      return <Error state={state} />

    default:
      return exhaustive(state)
  }
}
