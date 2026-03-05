import { writeFile, unlink } from 'fs/promises'
import { basename, extname, join } from 'path'

import { TEMP_PATH } from '@/constants/workspace'
import { RawScript, Script } from '@/handlers/cloud/types'
import { getTempScriptName } from '@/main/script'

async function createTempFile(script: RawScript) {
  const tempFilePath =
    script.path ?? join(TEMP_PATH, script.name || getTempScriptName())

  await writeFile(tempFilePath, script.content)

  return {
    name: basename(script.name, extname(script.name)),
    path: tempFilePath,

    async dispose() {
      try {
        await unlink(tempFilePath)
      } catch {
        // We tried our best
      }
    },
  }
}

export function toScriptFile(script: Script) {
  if (script.type === 'raw') {
    return createTempFile(script)
  }

  return {
    name: basename(script.path),
    path: script.path,
    dispose() {},
  }
}
