import { LoadingMessage } from '@/components/Profile/LoadingMessage'
import { PreparingState } from './types'

interface PreparingProps {
  state: PreparingState
}

export function Preparing(_state: PreparingProps) {
  return <LoadingMessage>Preparing...</LoadingMessage>
}
