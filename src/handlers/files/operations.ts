import { writeFile } from 'fs/promises'
import path from 'path'

import {
  BROWSER_TESTS_PATH,
  GENERATORS_PATH,
  SCRIPTS_PATH,
} from '@/constants/workspace'
import { trackEvent } from '@/services/usageTracking'
import { UsageEventName } from '@/services/usageTracking/types'
import { GeneratorFileData } from '@/types/generator'

import { FileContent, OpenFile } from './types'

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

function getFilePath({
  location,
  content,
}: OpenFile): Promise<string | undefined> {
  if (location.type === 'file-on-disk') {
    return Promise.resolve(location.path)
  }

  // TODO: Use a save dialog instead of auto-generating the path
  switch (content.type) {
    case 'http-test':
      return Promise.resolve(path.join(GENERATORS_PATH, location.name))

    case 'browser-test':
      return Promise.resolve(path.join(BROWSER_TESTS_PATH, location.name))

    case 'script':
      return Promise.resolve(path.join(SCRIPTS_PATH, location.name))

    default:
      return content satisfies never
  }
}

function serializeContent(content: FileContent): string {
  switch (content.type) {
    case 'http-test':
      return JSON.stringify(content.test, null, 2)

    case 'browser-test':
      return JSON.stringify(content.test, null, 2)

    case 'script':
      return content.content

    default:
      return content satisfies never
  }
}

export async function save(file: OpenFile): Promise<OpenFile> {
  const filePath = await getFilePath(file)

  if (filePath === undefined) {
    return file
  }

  const serializedContent = serializeContent(file.content)

  await writeFile(filePath, serializedContent, 'utf-8')

  trackSave(file)

  return {
    ...file,
    location: {
      type: 'file-on-disk',
      name: path.basename(filePath),
      path: filePath,
    },
  }
}
