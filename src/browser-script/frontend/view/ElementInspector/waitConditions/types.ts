import { BrowserEventTarget } from '@/schemas/recording'

export interface WaitForData {
  target: BrowserEventTarget
  options?: {
    state?: 'visible' | 'hidden' | 'attached' | 'detached'
    timeout?: number
  }
}
