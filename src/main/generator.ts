import log from 'electron-log/main'
import { existsSync } from 'fs'
import { readdir, rename } from 'fs/promises'
import path from 'path'

import { GENERATORS_PATH } from '@/constants/workspace'

// Used to convert `.json` files into the appropriate file extension for the Generator
export async function migrateJsonGenerator() {
  if (!existsSync(GENERATORS_PATH)) return

  const items = await readdir(GENERATORS_PATH, { withFileTypes: true })
  const files = items.filter(
    (f) => f.isFile() && path.extname(f.name) === '.json'
  )

  await Promise.all(
    files.map(async (f) => {
      try {
        const oldPath = path.join(GENERATORS_PATH, f.name)
        const newPath = path.join(
          GENERATORS_PATH,
          path.parse(f.name).name + '.k6g'
        )
        await rename(oldPath, newPath)
      } catch (error) {
        log.error(error)
      }
    })
  )
}
