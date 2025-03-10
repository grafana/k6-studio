import { exhaustive } from '@/utils/typescript'
import { SignIn } from './SignIn'
import { RunInCloudState } from './types'
import { Started } from './Started'
import { Error } from './Error'
import { Preparing } from './Preparing'
import { Initializing } from '@/components/Profile/GrafanaCloudSignIn/Initializing'
import { Uploading } from './Uploading'
import { Starting } from './Starting'

interface RunInCloudStatesProps {
  state: RunInCloudState
  onAbort: () => void
}

export function RunInCloudStates({ state }: RunInCloudStatesProps) {
  switch (state.type) {
    case 'initializing':
      return <Initializing state={state} />

    case 'sign-in':
      return <SignIn />

    case 'preparing':
      return <Preparing state={state} />

    case 'uploading':
      return <Uploading state={state} />

    case 'starting':
      return <Starting state={state} />

    case 'started':
      return <Started state={state} />

    case 'error':
      return <Error state={state} />

    default:
      return exhaustive(state)
  }
}

export * from './types'
