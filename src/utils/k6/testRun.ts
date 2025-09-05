import { ChildProcessWithoutNullStreams } from 'child_process'
import readline from 'readline/promises'

import { Check, CheckArraySchema, LogEntry, LogEntrySchema } from '@/schemas/k6'
import { EventEmitter } from 'extension/src/utils/events'

import { parseJsonAsSchema } from '../json'

// Copied from https://github.com/grafana/k6/blob/master/errext/exitcodes/codes.go
enum ExitCode {
  Success = 0,

  // CloudTestRunFailed indicates that the cloud test run failed.
  // Its value used to be 99 before k6 v0.33.0.
  CloudTestRunFailed = 97,

  // CloudFailedToGetProgress indicates that k6 was unable to synchronize the
  // test progress with the cloud.
  CloudFailedToGetProgress = 98,

  // ThresholdsHaveFailed indicates that one or more thresholds have failed.
  ThresholdsHaveFailed = 99,

  // SetupTimeout indicates the execution of the test setup function timed out.
  SetupTimeout = 100,

  // TeardownTimeout indicates the execution of the test teardown function timed out.
  TeardownTimeout = 101,

  // GenericTimeout indicates a timeout with an unspecified reason.
  GenericTimeout = 102,

  // ScriptStoppedFromRESTAPI indicates the execution has been
  // stopped by a call to the k6's REST API.
  ScriptStoppedFromRESTAPI = 103,

  // InvalidConfig indicates an invalid configuration.
  InvalidConfig = 104,

  // ExternalAbort indicates the test was aborted by an external signal
  // (e.g. SIGINT, SIGTERM, etc.) and should be considered aborted rather
  // than a failure.
  ExternalAbort = 105,

  // CannotStartRESTAPI indicates the k6's REST API server could not be started.
  CannotStartRESTAPI = 106,

  // ScriptException indicates an exception was thrown during the
  // test script's execution.
  ScriptException = 107,

  // ScriptAborted indicates the script was aborted by a call to the
  // k6 execution module's `test.abort()` function.
  ScriptAborted = 108,

  // GoPanic indicates the script was aborted by a panic in the Go runtime.
  GoPanic = 109,

  // MarkedAsFailed indicates that the test was marked as failed.
  MarkedAsFailed = 110,
}

interface PassedTestResult {
  passed: true
}

interface FailedTestResult {
  passed: false
}

type TestResult = PassedTestResult | FailedTestResult

export interface TestRunStartEvent {}

export interface TestRunErrorEvent {
  error: Error
}

export interface TestRunAbortEvent {}

export interface TestRunDoneEvent {
  result: TestResult
  checks: Check[]
}

export interface TestRunLogEvent {
  entry: LogEntry
}

interface TestRunEventMap {
  start: TestRunStartEvent
  error: TestRunErrorEvent
  abort: TestRunAbortEvent
  done: TestRunDoneEvent
  stop: void
  log: TestRunLogEvent
}

export class TestRun extends EventEmitter<TestRunEventMap> {
  #process: ChildProcessWithoutNullStreams

  #checks: Check[] = []

  constructor(process: ChildProcessWithoutNullStreams) {
    super()

    process.on('spawn', this.#handleStart)

    process.on('error', this.#handleError)

    process.on('close', this.#handleClose)

    readline.createInterface(process.stdout).on('line', (line) => {
      const checks = parseJsonAsSchema(line, CheckArraySchema)

      if (checks.success) {
        this.#checks.push(...checks.data)

        return
      }

      const log = parseJsonAsSchema(line, LogEntrySchema)

      if (!log.success) {
        return
      }

      this.emit('log', { entry: log.data })
    })

    readline.createInterface(process.stderr).on('line', (line) => {
      const log = parseJsonAsSchema(line, LogEntrySchema)

      if (!log.success) {
        return
      }

      this.emit('log', { entry: log.data })
    })

    this.#process = process

    this.on('done', this.#emitStop)
    this.on('abort', this.#emitStop)
    this.on('error', this.#emitStop)
  }

  isRunning(): boolean {
    return this.#process.pid != undefined && this.#process.exitCode === null
  }

  stop(): Promise<void> {
    if (!this.isRunning()) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.#process.once('close', resolve)

      this.#process.kill()
    })
  }

  #handleStart = () => {
    this.emit('start', {})
  }

  #handleError = (error: Error) => {
    this.emit('error', { error })
  }

  #handleClose = (code: number | null) => {
    switch (code) {
      case ExitCode.Success:
        this.emit('done', {
          result: {
            passed: true,
          },
          checks: this.#checks,
        })
        break

      case ExitCode.ScriptAborted:
      case ExitCode.ThresholdsHaveFailed:
      case ExitCode.MarkedAsFailed:
        this.emit('done', {
          result: {
            passed: false,
          },
          checks: this.#checks,
        })

        break

      case ExitCode.ScriptStoppedFromRESTAPI:
      case ExitCode.ExternalAbort:
        this.emit('abort', {})
        break

      case ExitCode.GoPanic:
        this.#handleError(new Error('k6 runtime panic'))
        break

      default:
        this.#handleError(new Error(`k6 exited with unhandled code ${code}`))
        break
    }
  }

  #emitStop = () => {
    this.emit('stop', undefined)
  }
}
