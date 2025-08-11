import { ipcMain } from 'electron'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { GENERATORS_PATH } from '@/constants/workspace'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { GeneratorFileData } from '@/types/generator'
import { createFileWithUniqueName } from '@/utils/fileSystem'
import { createNewGeneratorFile } from '@/utils/generator'

import { GeneratorHandler } from './types'

export function initialize() {
  ipcMain.handle(GeneratorHandler.Create, async (_, recordingPath: string) => {
    console.log(`${GeneratorHandler.Create} event received`)
    const generator = createNewGeneratorFile(recordingPath)
    const fileName = await createFileWithUniqueName({
      data: JSON.stringify(generator, null, 2),
      directory: GENERATORS_PATH,
      ext: '.k6g',
      prefix: 'Generator',
    })

    trackEvent({
      event: UsageEventName.GeneratorCreated,
    })

    return fileName
  })

  ipcMain.handle(
    GeneratorHandler.Save,
    async (_, generator: GeneratorFileData, fileName: string) => {
      console.log(`${GeneratorHandler.Save} event received`)
      invariant(!INVALID_FILENAME_CHARS.test(fileName), 'Invalid file name')

      await writeFile(
        path.join(GENERATORS_PATH, fileName),
        JSON.stringify(generator, null, 2)
      )

      trackEvent({
        event: UsageEventName.GeneratorUpdated,
      })
    }
  )

  ipcMain.handle(
    GeneratorHandler.Open,
    async (_, fileName: string): Promise<GeneratorFileData> => {
      console.log(`${GeneratorHandler.Open} event received`)
      const data = await readFile(path.join(GENERATORS_PATH, fileName), {
        encoding: 'utf-8',
        flag: 'r',
      })

      return GeneratorFileDataSchema.parse(JSON.parse(data))
    }
  )
}
