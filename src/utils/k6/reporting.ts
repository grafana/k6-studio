import express, { json } from 'express'
import { Server } from 'http'
import { AddressInfo } from 'net'

import { EventEmitter } from 'extension/src/utils/events'

interface TrackingEvent {
  action: unknown
}

interface ReportingServerEventMap {
  begin: TrackingEvent
  end: TrackingEvent
}

class ReportingServer extends EventEmitter<ReportingServerEventMap> {
  #server: Server

  get port() {
    return getPort(this.#server.address())
  }

  constructor(server: Server) {
    super()

    this.#server = server
  }

  dispose() {
    this.#server.close()
  }
}

function getPort(address: AddressInfo | string | null): number {
  if (address === null) {
    throw new Error('Server is not listening')
  }

  if (typeof address === 'string') {
    throw new Error('Unexpected string address')
  }

  return address.port
}

export async function createReportingServer(): Promise<ReportingServer> {
  const app = express()

  const httpServer = new Server(app)
  const reportingServer = new ReportingServer(httpServer)

  app.use(json())

  app.post('/track/:id/begin', (req, res) => {
    reportingServer.emit('begin', {
      action: req.body,
    })

    res.status(204).end()
  })

  app.post('/track/:id/end', (req, res) => {
    reportingServer.emit('end', {
      action: req.body,
    })

    res.status(204).end()
  })

  await new Promise((resolve, reject) => {
    httpServer.listen()

    httpServer.on('listening', () => {
      resolve({
        port: getPort(httpServer.address()),
        dispose: () => httpServer.close(),
      })
    })

    httpServer.on('error', reject)
  })

  return reportingServer
}
