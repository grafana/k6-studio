import { ipcMain } from 'electron'
import { writeFile } from 'fs/promises'
import path from 'path'

import { K6_GENERATOR_FILE_EXTENSION } from '@/constants/files'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { workspaceWindowFromEvent } from '@/utils/electron'
import { createFileWithUniqueName } from '@/utils/fileSystem'
import { createNewGeneratorFile } from '@/utils/generator'

import { GeneratorHandler } from './types'

export function initialize() {
  ipcMain.handle(
    GeneratorHandler.Create,
    async (event, recordingPath: string) => {
      console.log(`${GeneratorHandler.Create} event received`)
      const browserWindow = workspaceWindowFromEvent(event)

      const placeholderGenerator = createNewGeneratorFile('')
      const fileName = await createFileWithUniqueName({
        data: JSON.stringify(placeholderGenerator, null, 2),
        directory: browserWindow.workspace.paths.generators,
        ext: K6_GENERATOR_FILE_EXTENSION,
        prefix: 'Generator',
      })

      const newGeneratorPath = path.join(
        browserWindow.workspace.paths.generators,
        fileName
      )
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
    }
  )
}
