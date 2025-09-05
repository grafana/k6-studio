import log from 'electron-log/main'
import express, { json } from 'express'
import { Server } from 'http'
import { AddressInfo } from 'net'

import { EventEmitter } from 'extension/src/utils/events'

function getPort(address: AddressInfo | string | null): number {
  if (address === null) {
    throw new Error('Server is not listening')
  }

  if (typeof address === 'string') {
    throw new Error('Unexpected string address')
  }

  return address.port
}

interface TrackingEvent {
  action: unknown
}

interface ReportingServerEventMap {
  begin: TrackingEvent
  end: TrackingEvent
}

class TestRunTrackingServer extends EventEmitter<ReportingServerEventMap> {
  #server: Server

  get port() {
    return getPort(this.#server.address())
  }

  constructor(server: Server) {
    super()

    this.#server = server

    this.#server.on('close', () => {
      console.log('Test run tracking server closed.')
    })
  }

  dispose() {
    this.#server.close()
  }
}

export async function createTrackingServer(): Promise<TestRunTrackingServer> {
  const app = express()

  const httpServer = new Server(app)
  const trackingServer = new TestRunTrackingServer(httpServer)

  app.use(json())

  app.post('/track/:id/begin', (req, res) => {
    trackingServer.emit('begin', {
      action: req.body,
    })

    res.status(204).end()
  })

  app.post('/track/:id/end', (req, res) => {
    trackingServer.emit('end', {
      action: req.body,
    })

    res.status(204).end()
  })

  await new Promise<void>((resolve, reject) => {
    httpServer.listen()

    httpServer.on('listening', resolve)
    httpServer.on('error', (error) => {
      log.error('Failed to start tracking server', error)

      reject(error)
    })
  })

  console.log(
    `Test run tracking server has started on port ${trackingServer.port}`
  )

  return trackingServer
}
