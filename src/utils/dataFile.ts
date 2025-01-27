import { parse as parseCSV } from 'papaparse'

import { DataFilePreview, DataRecord } from '@/types/testData'
import { exhaustive } from './typescript'

export function parseDataFile(
  content: string,
  type: DataFilePreview['type']
): DataRecord[] {
  switch (type) {
    case 'json': {
      const parsedContent: unknown = JSON.parse(content)
      if (Array.isArray(parsedContent)) {
        return parsedContent as DataRecord[]
      }

      return [parsedContent] as DataRecord[]
    }
    case 'csv': {
      return parseCSV<DataRecord>(content, {
        header: true,
        delimiter: ',',
        skipEmptyLines: true,
      }).data
    }
    default:
      return exhaustive(type)
  }
}
