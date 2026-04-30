import { LoadZones as ControlledLoadZones } from '@/components/TestOptions/LoadZones'
import { useGeneratorStore } from '@/store/generator/useGeneratorStore'

export function LoadZones() {
  const loadZones = useGeneratorStore((s) => s.loadZones)
  const setLoadZones = useGeneratorStore((s) => s.setLoadZones)

  return <ControlledLoadZones value={loadZones} onChange={setLoadZones} />
}
