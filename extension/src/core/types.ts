import { BrowserEvent } from '@/schemas/recording'

import { EventEmitter } from '../utils/events'

export interface NavigationEventMap {
  navigate: { events: BrowserEvent[] }
}

export type NavigationEventEmitter = EventEmitter<NavigationEventMap>
