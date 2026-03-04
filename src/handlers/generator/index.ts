import { ipcMain } from 'electron'
import { writeFile } from 'fs/promises'
import path from 'path'

import { K6_GENERATOR_FILE_EXTENSION } from '@/constants/files'
import { GENERATORS_PATH } from '@/constants/workspace'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { createFileWithUniqueName } from '@/utils/fileSystem'
import { createNewGeneratorFile } from '@/utils/generator'

import { GeneratorHandler } from './types'

export function initialize() {
  ipcMain.handle(GeneratorHandler.Create, async (_, recordingPath: string) => {
    console.log(`${GeneratorHandler.Create} event received`)

    const placeholderGenerator = createNewGeneratorFile('')
    const fileName = await createFileWithUniqueName({
      data: JSON.stringify(placeholderGenerator, null, 2),
      directory: GENERATORS_PATH,
      ext: K6_GENERATOR_FILE_EXTENSION,
      prefix: 'Generator',
    })

    const newGeneratorPath = path.join(GENERATORS_PATH, fileName)
    const relativeRecordingPath =
      recordingPath !== ''
        ? path.relative(path.dirname(newGeneratorPath), recordingPath)
        : ''

    const generator = createNewGeneratorFile(relativeRecordingPath)

    await writeFile(newGeneratorPath, JSON.stringify(generator, null, 2))

    trackEvent({
      event: UsageEventName.GeneratorCreated,
    })

    return newGeneratorPath
  })
}
