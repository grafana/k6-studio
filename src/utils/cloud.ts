import { app } from 'electron'

const USER_AGENT_PREFIX = 'k6studio'

export function getUserAgent() {
  return `${USER_AGENT_PREFIX}/${app.getVersion()}`
}
