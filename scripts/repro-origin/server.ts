import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

export async function startOriginMock() {
  const requests: Array<{
    method: string
    origin: string | undefined
    path: string
  }> = []
  const server = createServer((req, res) => {
    const port = (server.address() as AddressInfo).port
    const app = `http://localhost:${port}`
    const api = `http://127.0.0.1:${port}`
    if (req.url?.startsWith('/token')) {
      requests.push({
        method: req.method!,
        origin: req.headers.origin,
        path: req.url,
      })
      if (req.url !== '/token-denied')
        res.setHeader('Access-Control-Allow-Origin', app)
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      res.setHeader('Access-Control-Allow-Methods', 'POST')
      res.statusCode =
        req.method === 'OPTIONS' ? 204 : req.headers.origin === app ? 200 : 400
      res.end(
        JSON.stringify({
          ok: res.statusCode === 200,
          origin: req.headers.origin ?? null,
        })
      )
      return
    }
    res.setHeader('Content-Type', 'text/html')
    if (req.url === '/child' || req.url === '/nested') {
      res.end(
        `<button id="child">Child</button><p id="text">Select this text</p>${req.url === '/child' ? `<iframe id="nested" src="${app}/nested"></iframe>` : ''}`
      )
      return
    }
    res.end(`<button id="login">Login</button><output id="result"></output>
      <iframe id="cross" src="${api}/child"></iframe>
      <iframe id="sandbox" sandbox src="${api}/nested"></iframe>
      <script>document.querySelector('#login').onclick = async () => {
        try {
          const response = await fetch('${api}/token', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'code=mock'});
          document.querySelector('#result').textContent = String(response.status);
        } catch (error) { document.querySelector('#result').textContent = error.message; }
      };</script>`)
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as AddressInfo).port
  return {
    server,
    requests,
    app: `http://localhost:${port}`,
    api: `http://127.0.0.1:${port}`,
  }
}
