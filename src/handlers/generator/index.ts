import { ipcMain } from 'electron'

import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { GeneratorFileData } from '@/types/generator'
import { readFile, writeFile } from '@/utils/fs'

import { createGenerator } from './create'
import { deserializeGenerator, serializeGenerator } from './serialization'
import { GeneratorHandler } from './types'

export function initialize() {
  ipcMain.handle(GeneratorHandler.Create, async (_, recordingPath: string) => {
    console.log(`${GeneratorHandler.Create} event received`)

    return createGenerator(recordingPath || undefined)
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
