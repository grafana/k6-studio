import log from 'electron-log/main'
import { parse } from 'plist'

import { readFile } from './fs'

export async function getExecutableNameFromPlist(plistPath: string) {
  const plistContent = await readFile(plistPath, 'utf-8')
  const plistData = parse(plistContent) as Record<string, unknown>

  if (typeof plistData.CFBundleExecutable === 'string') {
    return plistData.CFBundleExecutable
  } else {
    log.error(
      'CFBundleExecutable not found or not a string',
      plistData.CFBundleExecutable
    )
    return undefined
  }
}
