import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { DurationInput } from '@/components/DurationInput'

interface StartTimeProps {
  value?: string
  placeholder?: string
}
export function StartTime({ value = '', placeholder = '0s' }: StartTimeProps) {
  const { setStartTime } = useGeneratorStore()

  return (
    <DurationInput
      min={0}
      label="Start Time"
      placeholder={placeholder}
      value={value}
      tooltip="Time offset since the start of the test, at which point this scenario should begin
          execution."
      onChange={setStartTime}
    />
  )
}
