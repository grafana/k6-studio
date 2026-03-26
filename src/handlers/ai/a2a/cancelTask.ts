import log from 'electron-log/main'

import type { A2ASessionConfig } from './types'

const PREFIX = '[GrafanaAssistant]'

export async function sendTaskCancel(
  config: A2ASessionConfig,
  taskId: string
): Promise<void> {
  const body = {
    jsonrpc: '2.0',
    id: crypto.randomUUID(),
    method: 'tasks/cancel',
    params: { id: taskId },
  }

  const response = await fetch(`${config.baseUrl}/agents/${config.agentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.bearerToken}`,
      'X-App-Source': 'k6-studio',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    log.error(
      PREFIX,
      `Failed to cancel task ${taskId} (${response.status}):`,
      text
    )
  }
}
