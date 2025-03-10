import { LoadingMessage } from '@/components/Profile/LoadingMessage'
import { StartingState } from './types'

interface StartingProps {
  state: StartingState
}

export function Starting(_state: StartingProps) {
  return <LoadingMessage>Starting...</LoadingMessage>
}
