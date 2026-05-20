import log from 'electron-log/main'
import invariant from 'tiny-invariant'

import {
  deserializeGenerator,
  serializeGenerator,
} from '@/handlers/generator/serialization'
import { BrowserTestFileDataSchema } from '@/schemas/browserTest'
import { RecordingSchema } from '@/schemas/recording'
import { StudioFileType } from '@/types'
import { DataFilePreview } from '@/types/testData'
import { parseDataFile } from '@/utils/dataFile'
import { K6Client } from '@/utils/k6/client'
import * as path from '@/utils/path'
import { isExternalScript } from '@/utils/workspace'

import { FileContent } from './types'

export function serializeContent(
  filePath: string,
  content: FileContent
): string {
  switch (content.type) {
    case 'generator':
      return JSON.stringify(serializeGenerator(filePath, content.data), null, 2)

    case 'browser-test':
      return JSON.stringify(content.data, null, 2)

    case 'script':
      return content.data

    case 'recording':
    case 'data-file':
    case 'unsupported':
      throw new Error(`Cannot serialize content of type '${content.type}'`)
  }
}

export async function deserializeContent(
  filePath: string,
  raw: string,
  type: StudioFileType
): Promise<FileContent> {
  switch (type) {
    case 'generator':
      return { type: 'generator', data: deserializeGenerator(filePath, raw) }

    case 'browser-test':
      return {
        type: 'browser-test',
        data: BrowserTestFileDataSchema.parse(JSON.parse(raw)),
      }

    case 'recording':
      return { type: 'recording', data: RecordingSchema.parse(JSON.parse(raw)) }

    case 'script': {
      const options = await new K6Client()
        .inspect({ scriptPath: filePath })
        .catch((err) => {
          log.error('Failed to inspect script', err)
          return null
        })

      return {
        type: 'script',
        data: raw,
        isExternal: isExternalScript(filePath),
        options: options ?? {},
      }
    }

    case 'data-file': {
      const ext = path.extname(filePath).slice(1)
      invariant(ext === 'csv' || ext === 'json', 'Unsupported data file type')

      const parsedData = parseDataFile(raw, ext)
      const preview: DataFilePreview = {
        type: ext,
        data: parsedData.slice(0, 20),
        props: parsedData[0] ? Object.keys(parsedData[0]) : [],
        total: parsedData.length,
      }

      return { type: 'data-file', data: preview }
    }
  }
}
