import { Workspace } from '@/utils/workspace'

import * as ai from './ai'
import * as app from './app'
import * as auth from './auth'
import * as browser from './browser'
import * as browserRemote from './browserRemote'
import * as browserTest from './browserTest'
import * as cloud from './cloud'
import * as dataFiles from './dataFiles'
import * as file from './file'
import * as generator from './generator'
import * as har from './har'
import * as log from './log'
import * as proxy from './proxy'
import * as script from './script'
import * as settings from './settings'
import * as ui from './ui'

export function initialize(workspace: Workspace) {
  browserRemote.initialize()
  auth.initialize()
  cloud.initialize()
  file.initialize(workspace)
  har.initialize(workspace)
  browser.initialize()
  script.initialize(workspace)
  settings.initialize()
  proxy.initialize()
  ui.initialize(workspace)
  generator.initialize(workspace)
  browserTest.initialize(workspace)
  dataFiles.initialize(workspace)
  log.initialize()
  app.initialize()
  ai.initialize()
}
