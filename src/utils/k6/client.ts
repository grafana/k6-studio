import { spawn } from 'child_process'
import { app } from 'electron'
import path from 'path'
import readline from 'readline/promises'
import { z } from 'zod'

import { LogEntrySchema } from '@/schemas/k6'
import { K6Log } from '@/types'
import { getArch, getPlatform } from '@/utils/electron'

const TestOptionsSchema = z.object({
  cloud: z
    .object({
      name: z.string().nullish(),
      projectID: z.number().nullish(),
    })
    .nullish(),
})

type TestOptions = z.infer<typeof TestOptionsSchema>

const EXECUTABLE_NAME = getPlatform() === 'win' ? 'k6.exe' : 'k6'

const RESOURCES_PATH = MAIN_WINDOW_VITE_DEV_SERVER_URL
  ? path.join(app.getAppPath(), 'resources', getPlatform())
  : process.resourcesPath

const EXECUTABLE_PATH = path.join(RESOURCES_PATH, getArch(), EXECUTABLE_NAME)

interface SpawnArgs {
  args: Array<string[] | string | null | undefined | false>
  env?: NodeJS.ProcessEnv
}

interface SpawnResult {
  code: number | null
  stdout: string[]
  stderr: string[]
}

interface ArchiveArgs {
  scriptPath: string
  outputPath?: string
  logFormat?: 'json'
}

interface InspectArgs {
  scriptPath: string
}

export class ArchiveError extends Error {
  code: number | null
  stderr: K6Log[]

  constructor(code: number | null, stderr: K6Log[]) {
    super('Failed to archive script')

    this.code = code
    this.stderr = stderr
  }
}

export class K6Client {
  async archive({
    scriptPath,
    outputPath,
    logFormat,
  }: ArchiveArgs): Promise<void> {
    const { code, stderr } = await this.#spawn({
      args: [
        'archive',
        outputPath && ['--archive-out', outputPath],
        logFormat && ['--log-format', logFormat],
        scriptPath,
      ],
    })

    if (code !== 0) {
      const parsedErrors = stderr
        .map((line) => LogEntrySchema.safeParse(JSON.parse(line)))
        .filter((entry) => entry.success)
        .map((entry) => entry.data)

      throw new ArchiveError(code, parsedErrors)
    }
  }

  async inspect({ scriptPath }: InspectArgs): Promise<TestOptions | null> {
    const { code, stdout } = await this.#spawn({
      args: ['inspect', scriptPath],
    })

    if (code !== 0) {
      return null
    }

    const data: unknown = JSON.parse(stdout.join('\n'))
    const parsed = TestOptionsSchema.safeParse(data)

    if (!parsed.success) {
      return null
    }

    return parsed.data
  }

  #spawn({ args, env }: SpawnArgs): Promise<SpawnResult> {
    return new Promise<SpawnResult>((resolve, reject) => {
      const flattenedArgs = args
        .filter((arg) => arg !== null && arg !== undefined && arg !== false)
        .flat()

      const k6 = spawn(EXECUTABLE_PATH, flattenedArgs, {
        env: {
          ...process.env,
          ...env,
        },
      })

      const stdout: string[] = []
      const stderr: string[] = []

      readline.createInterface(k6.stdout).on('line', (line) => {
        stdout.push(line)
      })

      readline.createInterface(k6.stderr).on('line', (line) => {
        stderr.push(line)
      })

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
}
