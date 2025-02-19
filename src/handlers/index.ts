import { BrowserServer } from '@/services/browser/server'
import * as browserRemote from './browserRemote'

interface Services {
  browserServer: BrowserServer
}

export function initialize({ browserServer }: Services) {
  browserRemote.initialize(browserServer)
}
