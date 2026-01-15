import { StudioFile } from '@/types'

// eslint-disable-next-line no-control-regex
export const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1F]/

// TODO: Find a better way to handle large files
// Limit the file size for data files to avoid performance issues
export const MAX_DATA_FILE_SIZE = 1024 * 1024 * 10

export const K6_GENERATOR_FILE_EXTENSION = '.k6g'
export const K6_BROWSER_TEST_FILE_EXTENSION = '.k6b'

export const FileTypeToLabel: Record<StudioFile['type'], string> = {
  recording: 'recording',
  generator: 'generator',
  script: 'script',
  'data-file': 'data file',
  'browser-test': 'browser test',
}
