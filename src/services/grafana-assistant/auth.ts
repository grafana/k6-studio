const SCOPES = ['assistant:chat', 'assistant:a2a']

export interface GrafanaAssistantTokens {
  gatToken: string
  garToken: string
  apiEndpoint: string
  expiresAt: string
  refreshExpiresAt: string
}

interface ExchangeResponse {
  data: {
    token: string
    refresh_token: string
    api_endpoint: string
    expires_at: string
    refresh_expires_at: string
  }
}

export async function exchangeCodeForTokens(
  endpoint: string,
  code: string,
  codeVerifier: string,
  signal?: AbortSignal
): Promise<GrafanaAssistantTokens> {
  const url = `${endpoint.replace(/\/$/, '')}/api/cli/v1/auth/exchange`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: codeVerifier }),
    signal,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token exchange failed (${response.status}): ${text}`)
  }

  const { data } = (await response.json()) as ExchangeResponse

  return {
    gatToken: data.token,
    garToken: data.refresh_token,
    apiEndpoint: data.api_endpoint,
    expiresAt: data.expires_at,
    refreshExpiresAt: data.refresh_expires_at,
  }
}

export function buildAuthUrl(
  grafanaUrl: string,
  callbackPort: number,
  state: string,
  codeChallenge: string
): string {
  const base = grafanaUrl.replace(/\/$/, '')
  const params = new URLSearchParams({
    callback_port: String(callbackPort),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scopes: SCOPES.join(','),
  })
  return `${base}/a/grafana-assistant-app/cli/auth?${params.toString()}`
}
