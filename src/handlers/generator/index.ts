import { ipcMain } from 'electron'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { GENERATORS_PATH } from '@/constants/workspace'
import { GeneratorFileDataSchema } from '@/schemas/generator'
import { GeneratorFileData } from '@/types/generator'
import { createFileWithUniqueName } from '@/utils/fileSystem'
import { createNewGeneratorFile } from '@/utils/generator'

export function initialize() {
  ipcMain.handle('generator:create', async (_, recordingPath: string) => {
    const generator = createNewGeneratorFile(recordingPath)
    const fileName = await createFileWithUniqueName({
      data: JSON.stringify(generator, null, 2),
      directory: GENERATORS_PATH,
      ext: '.k6g',
      prefix: 'Generator',
    })

    return fileName
  })

  ipcMain.handle(
    'generator:save',
    async (_, generator: GeneratorFileData, fileName: string) => {
      invariant(!INVALID_FILENAME_CHARS.test(fileName), 'Invalid file name')

      await writeFile(
        path.join(GENERATORS_PATH, fileName),
        JSON.stringify(generator, null, 2)
      )
    }
  )

  ipcMain.handle(
    'generator:open',
    async (_, fileName: string): Promise<GeneratorFileData> => {
      const data = await readFile(path.join(GENERATORS_PATH, fileName), {
        encoding: 'utf-8',
        flag: 'r',
      })

      return GeneratorFileDataSchema.parse(JSON.parse(data))
    }
  )
}
