import log from 'electron-log/main'

import type { A2ASessionConfig } from './types'

const PREFIX = '[GrafanaAssistant]'

export async function sendRemoteToolResponse(
  config: A2ASessionConfig,
  payload: {
    requestId: string
    chatId: string
    success: boolean
    result?: unknown
    error?: string
  }
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/remote-tool-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.bearerToken}`,
      'X-App-Source': 'k6-studio',
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
