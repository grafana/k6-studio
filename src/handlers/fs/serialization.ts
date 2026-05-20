import { serializeGenerator } from '../generator/serialization'

import { FileContent } from './types'

export function serializeContent(path: string, content: FileContent): string {
  switch (content.type) {
    case 'generator':
      return JSON.stringify(serializeGenerator(path, content.data), null, 2)

    case 'browser-test':
      return JSON.stringify(content.content, null, 2)

    case 'script':
      return content.content
  }
}
