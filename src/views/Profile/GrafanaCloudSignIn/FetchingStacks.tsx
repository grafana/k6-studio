import { FetchingStacksState } from './types'
import { LoadingMessage } from '../LoadingMessage'

interface FetchingStacksProps {
  state: FetchingStacksState
}

export function FetchingStacks(_props: FetchingStacksProps) {
  return <LoadingMessage>Fetching stacks...</LoadingMessage>
}
