import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { app } from 'electron'
import log from 'electron-log/main'
import path from 'path'
import readline from 'readline/promises'
import { PassThrough, Readable } from 'stream'
import { pipeline } from 'stream/promises'

import { LogEntry, LogEntrySchema } from '@/schemas/k6'
import { getArch, getPlatform } from '@/utils/electron'
import { createWriteStream } from '@/utils/fs'

import { parseJsonAsSchema } from '../json'

import { K6TestOptions, TestOptionsSchema } from './schema'
import { TestRun } from './testRun'

const EXECUTABLE_NAME = getPlatform() === 'win' ? 'k6.exe' : 'k6'

function getDefaultExecutablePath() {
  const resourcesPath = import.meta.env.DEV
    ? path.join(app.getAppPath(), 'resources', getPlatform())
    : process.resourcesPath

  return path.join(resourcesPath, getArch(), EXECUTABLE_NAME)
}

interface SpawnArgs {
  args: Array<string[] | string | null | undefined | false>
  env?: NodeJS.ProcessEnv
  cwd?: string
}

interface SpawnResult {
  code: number | null
  stdout: string[]
  stderr: string[]
}

interface ArchiveArgs {
  scriptPath: string
  outputPath?: string
  cwd?: string
}

interface InspectArgs {
  scriptPath: string
}

interface RunArgs {
  path: string
  quiet?: boolean
  insecureSkipTLSVerify?: boolean
  noUsageReport?: boolean
  env?: Record<string, string>
}

export class ArchiveError extends Error {
  code: number | null
  stderr: LogEntry[]

  constructor(code: number | null, stderr: LogEntry[]) {
    super('Failed to archive script')

    this.code = code
    this.stderr = stderr
  }
}

export class K6Client {
  #executablePath: string

  constructor(executablePath: string = getDefaultExecutablePath()) {
    this.#executablePath = executablePath
  }

  async archive({
    scriptPath,
    outputPath = 'archive.tar',
    cwd,
  }: ArchiveArgs): Promise<void> {
    const stream = this.streamArchive({ scriptPath, cwd })
    const sink = createWriteStream(outputPath)

    await pipeline(stream, sink)
  }

  streamArchive({
    scriptPath,
    cwd,
  }: Omit<ArchiveArgs, 'outputPath'>): Readable {
    const k6Process = this.#spawn('archive', {
      args: [['--archive-out', '-'], ['--log-format', 'json'], scriptPath],
      cwd,
    })

    const stderr: string[] = []

    readline.createInterface(k6Process.stderr).on('line', (line) => {
      stderr.push(line)
    })

    const output = new PassThrough()

    k6Process.stdout.pipe(output, { end: false })

    k6Process.on('error', (error) => {
      output.destroy(error)
    })

    k6Process.on('close', (code) => {
      if (code === 0) {
        output.end()

        return
      }

      const parsedErrors = stderr
        .map((line) => parseJsonAsSchema(line, LogEntrySchema))
        .filter((entry) => entry.success)
        .map((entry) => entry.data)

      output.destroy(new ArchiveError(code, parsedErrors))
    })

    return output
  }

  async inspect({ scriptPath }: InspectArgs): Promise<K6TestOptions | null> {
    const process = this.#spawn('inspect', {
      args: [scriptPath],
    })

    const { code, stdout, stderr } = await this.#wait(process)

    if (code !== 0) {
      log.error('Failed to inspect the script', {
        code,
        stderr,
      })

      return null
    }

    const data: unknown = JSON.parse(stdout.join('\n'))
    const parsed = TestOptionsSchema.safeParse(data)

    if (!parsed.success) {
      return null
    }

    return parsed.data
  }

  run({
    path,
    quiet,
    insecureSkipTLSVerify,
    noUsageReport,
    env = {},
  }: RunArgs): TestRun {
    const args = [
      ['--log-format', 'json'],
      quiet && '--quiet',
      insecureSkipTLSVerify && '--insecure-skip-tls-verify',
      noUsageReport && '--no-usage-report',
      path,
    ]

    const process = this.#spawn('run', {
      args,
      env,
    })

    return new TestRun(process)
  }

  #wait(k6: ChildProcessWithoutNullStreams): Promise<SpawnResult> {
    const stdout: string[] = []
    const stderr: string[] = []

    readline.createInterface(k6.stdout).on('line', (line) => {
      stdout.push(line)
    })

    readline.createInterface(k6.stderr).on('line', (line) => {
      stderr.push(line)
    })

    if (k6.exitCode !== null) {
      return Promise.resolve({
        code: k6.exitCode,
        stdout,
        stderr,
      })
    }

    return new Promise<SpawnResult>((resolve, reject) => {
      k6.on('error', (error) => {
        reject(error)
      })

      k6.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
        })
      })
    })
  }

  #spawn(
    command: string,
    { args, env, cwd }: SpawnArgs
  ): ChildProcessWithoutNullStreams {
    const flattenedArgs = args
      .filter((arg) => arg !== null && arg !== undefined && arg !== false)
      .flat()

    return spawn(this.#executablePath, [command, ...flattenedArgs], {
      cwd,
      env: {
        ...process.env,
        ...env,
      },
    })
  }
}
