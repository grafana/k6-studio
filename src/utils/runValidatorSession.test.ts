import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RunValidatorSessionOptions } from './runValidatorSession'
import { runValidatorSession } from './runValidatorSession'

describe('runValidatorSession', () => {
  let finishedCb: (() => void) | undefined
  let failedCb: (() => void) | undefined
  let logCb: ((entry: { msg: string }) => void) | undefined
  let checkCb: ((checks: { id: string }[]) => void) | undefined

  beforeEach(() => {
    finishedCb = undefined
    failedCb = undefined
    logCb = undefined
    checkCb = undefined

    vi.stubGlobal('window', {
      studio: {
        proxy: {
          onProxyData: vi.fn(() => () => {}),
        },
        script: {
          onScriptFinished: vi.fn((cb: () => void) => {
            finishedCb = cb
            return () => {
              finishedCb = undefined
            }
          }),
          onScriptFailed: vi.fn((cb: () => void) => {
            failedCb = cb
            return () => {
              failedCb = undefined
            }
          }),
          onScriptLog: vi.fn((cb: (entry: { msg: string }) => void) => {
            logCb = cb
            return () => {
              logCb = undefined
            }
          }),
          onScriptCheck: vi.fn((cb: (checks: { id: string }[]) => void) => {
            checkCb = cb
            return () => {
              checkCb = undefined
            }
          }),
          runScriptFromGenerator: vi.fn().mockResolvedValue(undefined),
          runScript: vi.fn().mockResolvedValue(undefined),
          stopScript: vi.fn(),
        },
        validatorRun: {
          saveSession: vi.fn().mockResolvedValue(undefined),
        },
      },
    })
  })

  it('resolves with logs and checks when the run finishes (inline)', async () => {
    const p = runValidatorSession({
      mode: 'inline',
      script: 'export default function () {}',
      shouldTrack: false,
      runSourceLabel: 'test-run',
    })

    logCb?.({ msg: 'started' })
    checkCb?.([{ id: 'c1' }])
    finishedCb?.()

    await expect(p).resolves.toMatchObject({
      logs: [{ msg: 'started' }],
      checks: [{ id: 'c1' }],
      proxyData: [],
    })

    expect(window.studio.script.runScriptFromGenerator).toHaveBeenCalledWith(
      'export default function () {}',
      false
    )
  })

  it('runs by script path when mode is path', async () => {
    const p = runValidatorSession({
      mode: 'path',
      scriptPath: 'my-test.js',
    })

    finishedCb?.()

    await expect(p).resolves.toBeDefined()

    expect(window.studio.script.runScript).toHaveBeenCalledWith('my-test.js')
    expect(window.studio.script.runScriptFromGenerator).not.toHaveBeenCalled()
  })

  it('rejects when script failed fires', async () => {
    const p = runValidatorSession({
      mode: 'inline',
      script: 'bad',
      runSourceLabel: 'x',
    })

    failedCb?.()

    await expect(p).rejects.toThrow('k6 validation run failed')
  })

  it('rejects with AbortError when signal aborts before finish', async () => {
    const controller = new AbortController()
    const opts: RunValidatorSessionOptions = {
      mode: 'inline',
      script: 'export default function () {}',
      signal: controller.signal,
    }

    const p = runValidatorSession(opts)
    controller.abort()

    await expect(p).rejects.toMatchObject({ name: 'AbortError' })
    expect(window.studio.script.stopScript).toHaveBeenCalled()
  })
})
