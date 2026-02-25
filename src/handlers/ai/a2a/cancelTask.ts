import log from 'electron-log/main'

import { a2aConfig } from './config'

const PREFIX = '[GrafanaAssistant]'

export async function sendTaskCancel(taskId: string): Promise<void> {
  const body = {
    jsonrpc: '2.0',
    id: crypto.randomUUID(),
    method: 'tasks/cancel',
    params: { id: taskId },
  }

  const response = await fetch(
    `${a2aConfig.baseUrl}/agents/${a2aConfig.agentId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Scope-OrgID': a2aConfig.scopeOrgId,
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    log.error(
      PREFIX,
      `Failed to cancel task ${taskId} (${response.status}):`,
      text
    )
  }
}
