import { ipcMain } from 'electron'
import invariant from 'tiny-invariant'

import { INVALID_FILENAME_CHARS } from '@/constants/files'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { GeneratorFileData } from '@/types/generator'

import { save } from './operations'
import { FilesHandler, OpenFile } from './types'

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

function trackSave(file: OpenFile) {
  switch (file.content.type) {
    case 'generator':
      trackGeneratorUpdated(file.content.generator)
      break
  }

  return file
}

export function initialize() {
  ipcMain.handle(FilesHandler.Save, async (event, file: OpenFile) => {
    invariant(
      !INVALID_FILENAME_CHARS.test(file.location.name),
      'Invalid file name'
    )

    return trackSave(await save(file))
  })
}
