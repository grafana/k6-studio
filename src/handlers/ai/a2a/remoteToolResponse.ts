import log from 'electron-log/main'

import { a2aConfig } from './config'

const PREFIX = '[GrafanaAssistant]'

export async function sendRemoteToolResponse(payload: {
  requestId: string
  chatId: string
  success: boolean
  result?: unknown
  error?: string
}): Promise<void> {
  const response = await fetch(`${a2aConfig.baseUrl}/remote-tool-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Scope-OrgID': a2aConfig.scopeOrgId,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    log.error(
      PREFIX,
      `Failed to send remote tool response (${response.status}):`,
      text
    )
  }
}
