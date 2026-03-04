import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'

export interface RecordingData {
  requests: ProxyData[]
  browserEvents: BrowserEvent[]
}
