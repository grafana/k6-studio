import log from 'electron-log/main'
import { readFileSync } from 'fs'
import { parse } from 'plist'

export function getExecutableNameFromPlist(plistPath: string) {
  const plistContent = readFileSync(plistPath, 'utf-8')
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
