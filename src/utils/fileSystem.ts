import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

import { isNodeJsErrnoException } from './typescript'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** Calendar day folder name in local time, e.g. `2026-04-19`. */
export function formatLocalDayFolder(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Time-of-day for filenames in local time, e.g. `14-30-45`. */
export function formatLocalTimeForFilename(date: Date) {
  return `${pad2(date.getHours())}-${pad2(date.getMinutes())}-${pad2(date.getSeconds())}`
}

/**
 * Writes a HAR under `rootDirectory/<sourceLabel>/<local YYYY-MM-DD>/<HH-mm-ss>.har`
 * using local initiation time for the filename, appending ` (n)` if the base name collides.
 * Returns a POSIX relative path under `rootDirectory`
 * (e.g. `my-generator/2026-04-19/14-30-45.har`).
 */
export async function createValidatorRunHarFile({
  rootDirectory,
  startedAt,
  sourceLabel,
  data,
}: {
  rootDirectory: string
  startedAt: Date
  /** Sanitized filesystem segment (generator name, script name, etc.). */
  sourceLabel: string
  data: string
}): Promise<string> {
  const dayFolder = formatLocalDayFolder(startedAt)
  const directory = path.join(rootDirectory, sourceLabel, dayFolder)
  await mkdir(directory, { recursive: true })

  const timePart = formatLocalTimeForFilename(startedAt)
  const ext = '.har'
  const template = `${timePart}${ext}`

  let fileVersion = 2
  let uniqueFileName = template
  let fileCreated = false

  do {
    try {
      await writeFile(path.join(directory, uniqueFileName), data, {
        flag: 'ax+',
      })
      fileCreated = true
    } catch (error) {
      if (isNodeJsErrnoException(error) && error.code !== 'EEXIST') {
        throw error
      }

      const { name, ext: parsedExt } = path.parse(template)
      uniqueFileName = `${name} (${fileVersion})${parsedExt}`
      fileVersion++
    }
  } while (!fileCreated)

  return path.posix.join(sourceLabel, dayFolder, uniqueFileName)
}

export async function createFileWithUniqueName({
  directory,
  data,
  prefix,
  ext,
}: {
  directory: string
  data: string
  prefix: string
  ext: string
}): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0] ?? ''
  const template = `${prefix ? `${prefix} - ` : ''}${timestamp}${ext}`

  // Start from 2 as it follows the the OS behavior for duplicate files
  let fileVersion = 2
  let uniqueFileName = template
  let fileCreated = false

  do {
    try {
      // ax+ flag will throw an error if the file already exists
      await writeFile(path.join(directory, uniqueFileName), data, {
        flag: 'ax+',
      })
      fileCreated = true
    } catch (error) {
      if (isNodeJsErrnoException(error) && error.code !== 'EEXIST') {
        throw error
      }

      const { name, ext } = path.parse(template)
      uniqueFileName = `${name} (${fileVersion})${ext}`
      fileVersion++
    }
  } while (!fileCreated)

  return uniqueFileName
}
