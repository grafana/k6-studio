import { LoadZoneData } from '@/types/testOptions'
import { ImmerStateCreator } from '@/utils/typescript'

interface State {
  loadZones: LoadZoneData
}

interface Actions {
  setLoadZones: (loadZones: LoadZoneData) => void
}

export type LoadZoneStore = State & Actions

export const createLoadZoneSlice: ImmerStateCreator<LoadZoneStore> = (set) => ({
  loadZones: { distribution: 'even', zones: [] },
  setLoadZones: (loadZones: LoadZoneData) =>
    set((state) => {
      state.loadZones = loadZones
    }),
})
