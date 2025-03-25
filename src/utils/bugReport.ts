import { app, shell } from 'electron'

import { getPlatform } from './electron'

export function reportNewIssue() {
  const params = new URLSearchParams({
    template: 'bug.yaml',
    os: `${getPlatform()} ${process.getSystemVersion()}`,
    version: app.getVersion(),
  })

  return shell.openExternal(
    `https://github.com/grafana/k6-studio/issues/new?${params.toString()}`
  )
}
