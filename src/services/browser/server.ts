import { BrowserWindow } from 'electron'
import { RawData, WebSocketServer } from 'ws'
import { MessageEnvelope } from './schemas'

function tryParseMessage(data: RawData) {
  try {
    const buffer = data.toString('utf-8')

    return JSON.parse(buffer) as unknown
  } catch (error) {
    return undefined
  }
}

export function launchBrowserServer(browserWindow: BrowserWindow) {
  const ws = new WebSocketServer({
    host: 'localhost',
    port: 7554,
  })

  ws.on('connection', (socket) => {
    console.log('Browser connected...')

    socket.on('message', (data) => {
      const message = tryParseMessage(data)

      if (message === undefined) {
        console.log('Failed to parse message as JSON. Dropping.', data)

        return
      }

      const parsed = MessageEnvelope.safeParse(message)

      if (!parsed.success) {
        console.log('Received malformed message. Dropping.', message)

        return
      }

      console.log('received:', parsed.data)

      browserWindow.webContents.send(
        'browser:event',
        parsed.data.payload.events
      )
    })

    socket.on('close', () => {
      console.log('Browser disconnected...')
    })
  })

  return () => {
    ws.close()
  }
}
