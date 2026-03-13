import http from 'node:http'

const PORT_RANGE_START = 54321
const PORT_RANGE_END = 54399

export interface CallbackParams {
  code: string
  state: string
  endpoint: string
}

function tryListen(server: http.Server, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    server.once('error', () => resolve(false))
    server.listen(port, '127.0.0.1', () => resolve(true))
  })
}

export async function startCallbackServer(
  expectedState: string,
  signal: AbortSignal
): Promise<{ port: number; result: Promise<CallbackParams> }> {
  let resolveCallback!: (params: CallbackParams) => void
  let rejectCallback!: (error: Error) => void

  const result = new Promise<CallbackParams>((resolve, reject) => {
    resolveCallback = resolve
    rejectCallback = reject
  })

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1`)

    if (url.pathname !== '/callback') {
      res.writeHead(404)
      res.end()
      return
    }

    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const endpoint = url.searchParams.get('endpoint')

    if (!code || !state || !endpoint) {
      res.writeHead(400)
      res.end('Missing code, state, or endpoint')
      rejectCallback(new Error('Missing code, state, or endpoint in callback'))
      return
    }

    if (state !== expectedState) {
      res.writeHead(400)
      res.end('Invalid state')
      rejectCallback(new Error('State mismatch: possible CSRF attack'))
      return
    }

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(
      '<html><body><h1>Authentication successful</h1><p>You can close this tab and return to k6 Studio.</p></body></html>'
    )

    server.close()
    resolveCallback({ code, state, endpoint })
  })

  const handleAbort = () => {
    server.close()
    rejectCallback(new Error('Authentication aborted'))
  }
  signal.addEventListener('abort', handleAbort, { once: true })

  for (let port = PORT_RANGE_START; port <= PORT_RANGE_END; port++) {
    const ok = await tryListen(server, port)
    if (ok) {
      return { port, result }
    }
  }

  throw new Error(
    'Could not find an available port for the OAuth callback server'
  )
}
