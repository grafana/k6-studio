import { getProfileData } from '@/handlers/auth/fs'

import { getValidAssistantTokens } from './tokenRefresh'

export interface A2AConfig {
  baseUrl: string
  agentId: string
  remoteToolExtension: string
  bearerToken: string
}

const AGENT_ID = 'grafana_assistant_k6_studio'
const REMOTE_TOOL_EXTENSION =
  'https://grafana.com/extensions/remote-tool-execution/v1'

export async function getA2AConfig(): Promise<A2AConfig> {
  const profile = await getProfileData()
  const stackId = profile.profiles.currentStack

  if (!stackId) {
    throw new Error(
      'No Grafana Cloud stack selected. Please sign in to Grafana Cloud first.'
    )
  }

  const tokens = await getValidAssistantTokens(stackId)

  if (!tokens) {
    throw new Error(
      'Not authenticated with Grafana Assistant. Please connect to Grafana Assistant first.'
    )
  }

  return {
    baseUrl: `${tokens.apiEndpoint}/api/cli/v1/a2a`,
    agentId: AGENT_ID,
    remoteToolExtension: REMOTE_TOOL_EXTENSION,
    bearerToken: tokens.accessToken,
  }
}
