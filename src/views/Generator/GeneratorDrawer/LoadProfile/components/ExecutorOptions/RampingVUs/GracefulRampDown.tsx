import { useGeneratorStore } from '@/store/generator'
import { DurationInput } from '@/components/DurationInput'

interface GracefulRampDownProps {
  value?: string
  placeholder?: string
  error?: string
}

export function GracefulRampDown({
  value = '',
  placeholder = '30s',
}: GracefulRampDownProps) {
  const { setGracefulRampDown } = useGeneratorStore()

  return (
    <DurationInput
      min={0}
      label="Graceful Ramp Down"
      placeholder={placeholder}
      value={value}
      tooltip="Time to wait for an already started iteration to finish before stopping it during a ramp down."
      onChange={setGracefulRampDown}
    />
  )
}
