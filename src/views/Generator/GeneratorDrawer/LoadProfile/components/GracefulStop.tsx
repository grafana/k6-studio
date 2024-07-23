import { COMMON_DEFAULTS } from '../constants'
import { useGeneratorStore } from '@/store/generator'
import { DurationInput } from '@/components/DurationInput'

interface GracefulStopProps {
  value?: string
  placeholder?: string
}

export function GracefulStop({
  value = '',
  placeholder = COMMON_DEFAULTS.gracefulStop,
}: GracefulStopProps) {
  const { setGracefulStop } = useGeneratorStore()

  return (
    <DurationInput
      min={0}
      label="Graceful Stop"
      placeholder={placeholder}
      value={value}
      tooltip="Time to wait for iterations to finish executing before stopping them forcefully."
      onChange={setGracefulStop}
    />
  )
}
