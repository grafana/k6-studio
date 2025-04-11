import { writeFile } from 'fs/promises'
import path from 'path'

import { isNodeJsErrnoException } from './typescript'

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
