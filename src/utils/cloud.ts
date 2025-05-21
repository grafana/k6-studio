import { app } from 'electron'

export function getUserAgent() {
  return `k6studio/${app.getVersion()}`
}
