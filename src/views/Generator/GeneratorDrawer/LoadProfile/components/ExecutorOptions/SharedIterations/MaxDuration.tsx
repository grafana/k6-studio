import { useGeneratorStore } from '@/store/generator'
import { DurationInput } from '@/components/DurationInput'

interface MaxDurationProps {
  value?: number | string
  placeholder?: string
  info?: string
  error?: string
}

export function MaxDuration({
  value = '',
  placeholder = '10m',
}: MaxDurationProps) {
  const { setMaxDuration } = useGeneratorStore()

  return (
    <DurationInput
      min={0}
      label="Max Duration"
      placeholder={placeholder}
      value={value}
      tooltip="Maximum scenario duration before it's forcibly stopped (excluding 'Graceful Stop')."
      onChange={setMaxDuration}
    />
  )
}
