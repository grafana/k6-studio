import crypto from 'node:crypto'
import http from 'node:http'
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

const CALLBACK_PORT_MIN = 54321
const CALLBACK_PORT_MAX = 54399

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
  codeVerifier: string
): Promise<AssistantTokenResponse> {
  const url = `${normalizeStackUrl(apiEndpoint)}/api/cli/v1/auth/exchange`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: codeVerifier }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Assistant auth exchange failed (${response.status}): ${text}`
    )
  }

  const body = ExchangeApiResponseSchema.parse(await response.json())

  return body.data
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
 * The server listens on a random port in the 54321-54399 range and
 * shuts down after receiving the callback or when the signal is aborted.
 */
export function startCallbackServer(
  signal: AbortSignal
): Promise<{ port: number; waitForCallback: () => Promise<CallbackResult> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer({ keepAliveTimeout: 0 })

    function closeServer() {
      server.close()
      server.closeAllConnections()
    }

    const callbackPromise = new Promise<CallbackResult>(
      (resolveCallback, rejectCallback) => {
        signal.addEventListener(
          'abort',
          () => {
            closeServer()
            rejectCallback(new Error('Auth flow aborted'))
          },
          { once: true }
        )

        server.on('request', (req, res) =>
          handleCallbackRequest(
            req,
            res,
            closeServer,
            resolveCallback,
            rejectCallback
          )
        )
      }
    )

    listenOnAvailablePort(server, resolve, reject, callbackPromise)
  })
}

export function handleCallbackRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  closeServer: () => void,
  resolveCallback: (result: CallbackResult) => void,
  rejectCallback: (error: Error) => void
) {
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
  res.end(isSuccess ? successPage() : cancelledPage())

  if (error) {
    rejectCallback(new Error(`Authorization denied: ${error}`))
  } else if (code && state) {
    resolveCallback({ code, state, endpoint, tenant, email })
  } else {
    rejectCallback(new Error('Missing code or state in auth callback'))
  }

  closeServer()
}

function listenOnAvailablePort(
  server: http.Server,
  resolve: (value: {
    port: number
    waitForCallback: () => Promise<CallbackResult>
  }) => void,
  reject: (error: Error) => void,
  callbackPromise: Promise<CallbackResult>
) {
  const tryPort = (port: number) => {
    if (port > CALLBACK_PORT_MAX) {
      reject(new Error('No available port for OAuth callback server'))
      return
    }

    server.once('error', () => {
      tryPort(port + 1)
    })

    server.listen(port, '127.0.0.1', () => {
      server.removeAllListeners('error')
      resolve({
        port,
        waitForCallback: () => callbackPromise,
      })
    })
  }

  tryPort(CALLBACK_PORT_MIN)
}

function normalizeStackUrl(stackUrl: string): string {
  return stackUrl.endsWith('/') ? stackUrl.slice(0, -1) : stackUrl
}
