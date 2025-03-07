import { LoadZoneItem } from '@/types/testOptions'

export function createLoadZone(loadZone?: Partial<LoadZoneItem>): LoadZoneItem {
  return {
    id: crypto.randomUUID(),
    loadZone: 'amazon:us:columbus',
    percent: 50,
    ...loadZone,
  }
}
