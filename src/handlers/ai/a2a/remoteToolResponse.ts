import { buildA2AHeaders } from './helpers'
import type { A2ASessionConfig } from './types'

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
    headers: buildA2AHeaders(config),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Failed to send remote tool response (${response.status}): ${text}`
    )
  }
}
