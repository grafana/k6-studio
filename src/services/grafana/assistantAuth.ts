import crypto from 'node:crypto'
import { once } from 'node:events'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { z } from 'zod'

import { cancelledPage, successPage } from './assistantAuthCallbackPage'

interface PKCE {
  codeVerifier: string
  codeChallenge: string
}

export function generatePKCE(): PKCE {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  return { codeVerifier, codeChallenge }
}

export function generateState(): string {
  return crypto.randomBytes(16).toString('base64url')
}

export function buildAssistantAuthUrl(
  stackUrl: string,
  codeChallenge: string,
  state: string,
  callbackPort: number
): string {
  const url = new URL(
    '/a/grafana-assistant-app/cli/auth',
    normalizeStackUrl(stackUrl)
  )

  url.searchParams.set('callback_port', String(callbackPort))
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('scopes', 'assistant:chat,assistant:a2a')
  url.searchParams.set('device_name', 'k6 Studio')

  return url.toString()
}

const AssistantTokenResponseSchema = z.object({
  token: z.string(),
  refresh_token: z.string(),
  expires_at: z.string(),
  refresh_expires_at: z.string(),
  api_endpoint: z.string(),
})

export type AssistantTokenResponse = z.infer<
  typeof AssistantTokenResponseSchema
>

const ExchangeApiResponseSchema = z.object({
  data: AssistantTokenResponseSchema,
})

export async function exchangeAssistantCode(
  apiEndpoint: string,
  code: string,
  codeVerifier: string,
  signal?: AbortSignal
): Promise<AssistantTokenResponse> {
  const url = `${normalizeStackUrl(apiEndpoint)}/api/cli/v1/auth/exchange`

  const timeoutController = new AbortController()
  const timeout = setTimeout(() => timeoutController.abort(), 30_000)

  if (signal) {
    signal.addEventListener('abort', () => timeoutController.abort(), {
      once: true,
    })
    if (signal.aborted) {
      timeoutController.abort()
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: codeVerifier }),
      signal: timeoutController.signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Assistant auth exchange failed (${response.status}): ${text}`
      )
    }

    const body = ExchangeApiResponseSchema.parse(await response.json())

    return body.data
  } finally {
    clearTimeout(timeout)
  }
}

export interface CallbackResult {
  code: string
  state: string
  endpoint: string | null
  tenant: string | null
  email: string | null
}

/**
 * Starts a temporary local HTTP server to receive the OAuth callback.
 * Uses an OS-assigned port to avoid reuse conflicts with lingering sockets.
 */
export async function startCallbackServer(
  signal: AbortSignal
): Promise<{ port: number; result: Promise<CallbackResult> }> {
  const server = http.createServer({ keepAliveTimeout: 0 })

  function closeServer() {
    if (server.address() === null) {
      return
    }

    server.close()
    server.closeAllConnections()
  }

  const aborted = rejectOnAbort(signal)
  const result = handleCallbackRequest(server)

  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const { port } = server.address() as AddressInfo

  return {
    port,
    result: Promise.race([result, aborted]).finally(closeServer),
  }
}

function rejectOnAbort(signal: AbortSignal) {
  // Typed as `never` to guarantee it will never be resolved and
  // can be ruled out during type inference of `Promise.race`.
  const { promise, reject } = Promise.withResolvers<never>()

  function abort() {
    reject(new Error('Auth flow aborted'))
  }

  if (signal.aborted) {
    abort()

    return promise
  }

  signal.addEventListener('abort', abort)

  return promise
}

export function handleCallbackRequest(server: http.Server) {
  const { promise, resolve, reject } = Promise.withResolvers<CallbackResult>()

  server.on('request', (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')

    if (url.pathname !== '/callback') {
      res.writeHead(404)
      res.end()
      return
    }

    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    const endpoint = url.searchParams.get('endpoint')
    const tenant = url.searchParams.get('tenant')
    const email = url.searchParams.get('email')

    const isSuccess = !error && code && state

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(isSuccess ? successPage() : cancelledPage(), () => {
      if (error) {
        reject(new Error(`Authorization denied: ${error}`))
      } else if (code && state) {
        resolve({ code, state, endpoint, tenant, email })
      } else {
        reject(new Error('Missing code or state in auth callback'))
      }
    })
  })

  return promise
}

function normalizeStackUrl(stackUrl: string): string {
  return stackUrl.endsWith('/') ? stackUrl.slice(0, -1) : stackUrl
}
