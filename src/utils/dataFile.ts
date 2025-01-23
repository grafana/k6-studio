import { DataFilePreview, DataFileItem } from '@/types/testData'
import { exhaustive } from './typescript'

export function parseDataFile(
  content: string,
  type: DataFilePreview['type']
): DataFileItem[] {
  switch (type) {
    case 'json': {
      const parsedContent: unknown = JSON.parse(content)
      if (Array.isArray(parsedContent)) {
        return parsedContent as DataFileItem[]
      }

      return [parsedContent] as DataFileItem[]
    }
    case 'csv': {
      // TODO: switch to a suitable library to parse CSV before making the feature public
      return content.split('\n').map((row) => {
        const columns = row.split(',')
        return columns.reduce(
          (acc, column, index) => {
            acc[index] = column
            return acc
          },
          {} as Record<string, string>
        )
      })
    }
    default:
      return exhaustive(type)
  }
}
