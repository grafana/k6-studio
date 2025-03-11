import { LoadingMessage } from '@/components/Profile/LoadingMessage'
import { UploadingState } from './types'

interface UploadingProps {
  state: UploadingState
}

export function Uploading(_state: UploadingProps) {
  return <LoadingMessage>Uploading...</LoadingMessage>
}
