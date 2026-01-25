import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { GeneratorFileData } from '@/types/generator'

import { OpenFile } from './types'

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

export function trackFileSaved(file: OpenFile) {
  switch (file.content.type) {
    case 'recording':
      trackEvent({
        event: UsageEventName.RecordingCreated,
      })
      break

    case 'http-test':
      trackGeneratorUpdated(file.content.test)
      break

    case 'browser-test':
      trackEvent({
        event: UsageEventName.BrowserTestUpdated,
      })
      break

    case 'script':
      trackEvent({
        event: UsageEventName.ScriptExported,
      })
      break

    default:
      file.content satisfies never
      break
  }

  return file
}
