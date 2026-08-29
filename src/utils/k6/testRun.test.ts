import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createK6Check } from '@/test/factories/k6Check'

import { TestRun, TestRunDoneEvent, TestRunErrorEvent } from './testRun'

vi.mock('readline/promises', () => ({
  default: {
    createInterface: (stream: PassThrough) => {
      const emitter = new EventEmitter()

      stream.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean)
        for (const line of lines) {
          emitter.emit('line', line)
        }
      })

      return emitter
    },
  },
}))

function createMockProcess() {
  const stdout = new PassThrough()
  const stderr = new PassThrough()
  const process = new EventEmitter() as EventEmitter & {
    stdout: PassThrough
    stderr: PassThrough
    pid: number | undefined
    exitCode: number | null
    kill: () => boolean
  }

  process.stdout = stdout
  process.stderr = stderr
  process.pid = 1234
  process.exitCode = null
  process.kill = vi.fn(() => true)

  return process
}

function writeChecks(
  proc: ReturnType<typeof createMockProcess>,
  checks: ReturnType<typeof createK6Check>[]
) {
  proc.stdout.write(JSON.stringify(checks) + '\n')
}

describe('TestRun', () => {
  let proc: ReturnType<typeof createMockProcess>

  beforeEach(() => {
    proc = createMockProcess()
  })

  it('emits done with passed=true and checks on exit code 0', () => {
    const testRun = new TestRun(proc as never)
    const done = vi.fn<(ev: TestRunDoneEvent) => void>()
    testRun.on('done', done)

    const checks = [createK6Check({ id: '1', name: 'status is 200' })]
    writeChecks(proc, checks)

    proc.emit('close', 0)

    expect(done).toHaveBeenCalledWith({
      result: { passed: true },
      checks,
    })
  })

  it('emits done with passed=false and checks on ScriptException (107)', () => {
    const testRun = new TestRun(proc as never)
    const done = vi.fn<(ev: TestRunDoneEvent) => void>()
    const error = vi.fn<(ev: TestRunErrorEvent) => void>()
    testRun.on('done', done)
    testRun.on('error', error)

    const checks = [
      createK6Check({ id: '1', name: 'status is 200', passes: 1, fails: 0 }),
      createK6Check({ id: '2', name: 'body contains token', passes: 1, fails: 0 }),
    ]
    writeChecks(proc, checks)

    proc.emit('close', 107)

    expect(error).not.toHaveBeenCalled()
    expect(done).toHaveBeenCalledWith({
      result: { passed: false },
      checks,
    })
  })

  it('emits done with passed=false and checks on ThresholdsHaveFailed (99)', () => {
    const testRun = new TestRun(proc as never)
    const done = vi.fn<(ev: TestRunDoneEvent) => void>()
    testRun.on('done', done)

    const checks = [createK6Check({ id: '1', name: 'check 1' })]
    writeChecks(proc, checks)

    proc.emit('close', 99)

    expect(done).toHaveBeenCalledWith({
      result: { passed: false },
      checks,
    })
  })

  it('emits done with passed=false and checks on SetupTimeout (100)', () => {
    const testRun = new TestRun(proc as never)
    const done = vi.fn<(ev: TestRunDoneEvent) => void>()
    testRun.on('done', done)

    writeChecks(proc, [])
    proc.emit('close', 100)

    expect(done).toHaveBeenCalledWith({
      result: { passed: false },
      checks: [],
    })
  })

  it('emits abort on ExternalAbort (105)', () => {
    const testRun = new TestRun(proc as never)
    const abort = vi.fn()
    testRun.on('abort', abort)

    proc.emit('close', 105)

    expect(abort).toHaveBeenCalled()
  })

  it('emits error on GoPanic (109)', () => {
    const testRun = new TestRun(proc as never)
    const error = vi.fn<(ev: TestRunErrorEvent) => void>()
    testRun.on('error', error)

    proc.emit('close', 109)

    expect(error).toHaveBeenCalledWith({
      error: new Error('k6 runtime panic'),
    })
  })

  it('emits error on unknown exit codes', () => {
    const testRun = new TestRun(proc as never)
    const error = vi.fn<(ev: TestRunErrorEvent) => void>()
    testRun.on('error', error)

    proc.emit('close', 42)

    expect(error).toHaveBeenCalledWith({
      error: new Error('k6 exited with unhandled code 42'),
    })
  })

  it('emits stop after done', () => {
    const testRun = new TestRun(proc as never)
    const events: string[] = []
    testRun.on('done', () => events.push('done'))
    testRun.on('stop', () => events.push('stop'))

    proc.emit('close', 0)

    expect(events).toEqual(['done', 'stop'])
  })

  it('emits stop after error', () => {
    const testRun = new TestRun(proc as never)
    const events: string[] = []
    testRun.on('error', () => events.push('error'))
    testRun.on('stop', () => events.push('stop'))

    proc.emit('close', 109)

    expect(events).toEqual(['error', 'stop'])
  })
})
