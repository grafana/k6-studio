import { LoadProfile as ControlledLoadProfile } from '@/components/TestOptions/LoadProfile'
import {
  selectLoadProfileExecutorOptions,
  useGeneratorStore,
} from '@/store/generator'
import { LoadProfileExecutorOptions } from '@/types/testOptions'

export function LoadProfile() {
  const value = useGeneratorStore(selectLoadProfileExecutorOptions)
  const setExecutor = useGeneratorStore((s) => s.setExecutor)
  const setStages = useGeneratorStore((s) => s.setStages)
  const setVus = useGeneratorStore((s) => s.setVus)
  const setIterations = useGeneratorStore((s) => s.setIterations)

  const handleChange = (next: LoadProfileExecutorOptions) => {
    setExecutor(next.executor)
    if (next.executor === 'ramping-vus') {
      setStages(next.stages)
    }
    if (next.executor === 'shared-iterations') {
      setVus(next.vus)
      setIterations(next.iterations)
    }
  }

  return (
    <ControlledLoadProfile
      value={value}
      onChange={handleChange}
      executors={['ramping-vus', 'shared-iterations']}
    />
  )
}
