import { describe, expect, it } from 'vitest'

import {
  ChromeCommand,
  ChromeDevToolsClient,
  Transport,
} from '@/utils/cdp/client'

import { Page } from './page'
import { Script } from './script'

class FakeTransport implements Transport {
  calls: ChromeCommand[] = []

  // Mimics a popup opened with noopener/noreferrer: while such a page is
  // paused waiting for the debugger, Chrome doesn't respond to any session
  // command until Runtime.runIfWaitingForDebugger has been sent.
  #holdResponsesUntilResume: boolean
  #heldResponses: Array<() => void> = []

  constructor(holdResponsesUntilResume: boolean) {
    this.#holdResponsesUntilResume = holdResponsesUntilResume
  }

  call<Return>(command: ChromeCommand): Promise<Return> {
    this.calls.push(command)

    const result = {} as Return

    if (!this.#holdResponsesUntilResume) {
      return Promise.resolve(result)
    }

    if (command.method === 'Runtime.runIfWaitingForDebugger') {
      this.#heldResponses.splice(0).forEach((respond) => respond())

      return Promise.resolve(result)
    }

    const { promise, resolve } = Promise.withResolvers<Return>()

    this.#heldResponses.push(() => resolve(result))

    return promise
  }

  on() {
    return () => {}
  }

  off() {}

  dispose() {}
}

function setup(holdResponsesUntilResume = false) {
  const transport = new FakeTransport(holdResponsesUntilResume)
  const client = new ChromeDevToolsClient(transport)
  const page = new Page('tab-1', client, new Script('script-content'))

  return { transport, page }
}

function scriptCalls(transport: FakeTransport) {
  return transport.calls.filter(
    (call) => call.method === 'Page.addScriptToEvaluateOnNewDocument'
  )
}

describe('Page.attach', () => {
  it(
    'registers scripts before resuming a paused popup that holds command responses until resume',
    { timeout: 1000 },
    async () => {
      const { transport, page } = setup(true)

      await page.attach({ waitingForDebugger: true })

      const methods = transport.calls.map((call) => call.method)

      expect(
        methods.lastIndexOf('Page.addScriptToEvaluateOnNewDocument')
      ).toBeLessThan(methods.indexOf('Runtime.runIfWaitingForDebugger'))
    }
  )

  // A paused target only has its empty initial document, and executing the
  // recording script there wedges the renderer of noopener/noreferrer popups.
  it.each([
    { waitingForDebugger: false, runImmediately: true },
    { waitingForDebugger: true, runImmediately: false },
  ])(
    'injects scripts with runImmediately: $runImmediately when waitingForDebugger is $waitingForDebugger',
    async ({ waitingForDebugger, runImmediately }) => {
      const { transport, page } = setup()

      await page.attach({ waitingForDebugger })

      const calls = scriptCalls(transport)

      expect(calls).toHaveLength(2)
      calls.forEach((call) => {
        expect(call.params).toMatchObject({ runImmediately })
      })
    }
  )
})
