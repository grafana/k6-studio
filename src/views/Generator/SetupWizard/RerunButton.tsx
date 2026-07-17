import { Button } from '@radix-ui/themes'
import { RefreshCwIcon } from 'lucide-react'

interface RerunButtonProps {
  onRerun: () => void
}

export function RerunButton({ onRerun }: RerunButtonProps) {
  return (
    <Button variant="outline" color="gray" size="1" onClick={onRerun}>
      <RefreshCwIcon size={13} />
      Run step again
    </Button>
  )
}
