export const a2aConfig = {
  baseUrl: 'http://localhost:9091/api/v1/a2a',
  agentId: 'grafana_assistant_k6_studio',
  remoteToolExtension:
    'https://grafana.com/extensions/remote-tool-execution/v1',
  scopeOrgId: '123',
  grafanaUrl: 'http://localhost:3000',
  grafanaApiKey: 'local-dev',
} as const
