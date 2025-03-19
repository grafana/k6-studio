import * as auth from './auth'
import * as cloud from './cloud'

export function initialize() {
  auth.initialize()
  cloud.initialize()
}
