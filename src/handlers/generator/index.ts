import { ipcMain } from 'electron'
import * as path from 'pathe'

import { K6_GENERATOR_FILE_EXTENSION } from '@/constants/files'
import { GENERATORS_PATH } from '@/constants/workspace'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { GeneratorFileData } from '@/types/generator'
import { createFileWithUniqueName, readFile, writeFile } from '@/utils/fs'
import { createNewGeneratorFile } from '@/utils/generator'

import { deserializeGenerator, serializeGenerator } from './serialization'
import { GeneratorHandler } from './types'

export function initialize() {
  ipcMain.handle(GeneratorHandler.Create, async (_, recordingPath: string) => {
    console.log(`${GeneratorHandler.Create} event received`)
    const generator = createNewGeneratorFile(recordingPath || undefined)

    const filePath = await createFileWithUniqueName({
      data: JSON.stringify(
        serializeGenerator(getGeneratorPath('Generator'), generator),
        null,
        2
      ),
      directory: GENERATORS_PATH,
      ext: K6_GENERATOR_FILE_EXTENSION,
      prefix: 'Generator',
    })

    trackEvent({
      event: UsageEventName.GeneratorCreated,
    })

    return filePath
  })

  ipcMain.handle(
    GeneratorHandler.Save,
    async (_, generator: GeneratorFileData, filePath: string) => {
      console.log(`${GeneratorHandler.Save} event received`)

      await writeFile(
        filePath,
        JSON.stringify(serializeGenerator(filePath, generator), null, 2)
      )

      trackGeneratorUpdated(generator)
    }
  )

  ipcMain.handle(
    GeneratorHandler.Open,
    async (_, filePath: string): Promise<GeneratorFileData> => {
      console.log(`${GeneratorHandler.Open} event received`)

      const data = await readFile(filePath, {
        encoding: 'utf-8',
        flag: 'r',
      })

      return deserializeGenerator(filePath, data)
    }
  )
}

function getGeneratorPath(name: string) {
  return path.join(GENERATORS_PATH, `${name}${K6_GENERATOR_FILE_EXTENSION}`)
}

function trackGeneratorUpdated({ rules }: GeneratorFileData) {
  trackEvent({
    event: UsageEventName.GeneratorUpdated,
    payload: {
      rules: {
        correlation: rules.filter((rule) => rule.type === 'correlation').length,
        parameterization: rules.filter(
          (rule) => rule.type === 'parameterization'
        ).length,
        verification: rules.filter((rule) => rule.type === 'verification')
          .length,
        customCode: rules.filter((rule) => rule.type === 'customCode').length,
        disabled: rules.filter((rule) => !rule.enabled).length,
      },
    },
  })
}
