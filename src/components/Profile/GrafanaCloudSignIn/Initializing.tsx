import { InitializingState } from '@/types/auth'

import { LoadingMessage } from '../LoadingMessage'

interface InitializingProps {
  state: InitializingState
}

export function Initializing(_props: InitializingProps) {
  return <LoadingMessage>Opening Grafana Cloud in a browser...</LoadingMessage>
}
