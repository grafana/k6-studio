import { LoadingMessage } from '../LoadingMessage'
import { FetchingTokenState } from '@/types/auth'

interface FetchingTokenProps {
  state: FetchingTokenState
}

export function FetchingToken({ state }: FetchingTokenProps) {
  return <LoadingMessage>Signing in to {state.stack.name}...</LoadingMessage>
}
