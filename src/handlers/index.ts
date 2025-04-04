import * as auth from './auth'
import * as cloud from './cloud'
import * as har from './har'

export function initialize() {
  auth.initialize()
  cloud.initialize()
  har.initialize()
}
