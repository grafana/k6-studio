import { StudioFile } from '@/types'

// eslint-disable-next-line no-control-regex
export const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1F]/

/** System-generated files to ignore when listing directories */
const IGNORED_SYSTEM_FILES = new Set([
  '.DS_Store', // macOS
  'Thumbs.db', // Windows
  'desktop.ini', // Windows
  'ehthumbs.db', // Windows thumbnail cache
  '.directory', // KDE Dolphin
])

/** AppleDouble/resource fork files (macOS) */
export function isIgnoredSystemFile(basename: string): boolean {
  return IGNORED_SYSTEM_FILES.has(basename) || basename.startsWith('._')
}

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
