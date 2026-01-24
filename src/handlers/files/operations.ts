import { writeFile } from 'fs/promises'

import { FileContent, OpenFile } from './types'

function serializeContent(content: FileContent): string {
  switch (content.type) {
    case 'generator':
      return JSON.stringify(content.generator, null, 2)

    default:
      return content.type satisfies never
  }
}

export async function save(file: OpenFile): Promise<OpenFile> {
  const serializedContent = serializeContent(file.content)

  await writeFile(file.location.path, serializedContent, 'utf-8')

  return file
}
