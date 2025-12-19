import cors from 'cors'
import log from 'electron-log/main'
import express, { json } from 'express'
import { Server } from 'http'
import { AddressInfo } from 'net'

import {
  ActionBeginEvent,
  ActionBeginEventSchema,
  ActionEndEvent,
  ActionEndEventSchema,
  SessionReplayEventSchema,
} from '@/main/runner/schema'
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

interface ReportingServerEventMap {
  begin: ActionBeginEvent
  end: ActionEndEvent
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

  app.use(
    cors({
      origin: '*',
    })
  )

  app.use(json())

  app.post('/track/:id/begin', (req, res) => {
    const parsed = ActionBeginEventSchema.safeParse(req.body)

    if (!parsed.success) {
      log.warn('Received invalid begin action event: ', parsed.error.format())

      res.status(400).end()

      return
    }

    trackingServer.emit('begin', parsed.data)

    res.status(204).end()
  })

  app.post('/track/:id/end', (req, res) => {
    const parsed = ActionEndEventSchema.safeParse(req.body)

    if (!parsed.success) {
      log.warn('Received invalid end action event: ', parsed.error.format())

      res.status(400).end()

      return
    }

    trackingServer.emit('end', parsed.data)

    res.status(204).end()
  })

  app.post('/session-replay', (req, res) => {
    const parsed = SessionReplayEventSchema.safeParse(req.body)

    if (!parsed.success) {
      log.warn('Received invalid session replay event: ', parsed.error.format())

      res.status(400).end()

      return
    }

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
