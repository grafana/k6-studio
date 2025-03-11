// eslint-disable-next-line no-control-regex
export const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1F]/

// TODO: Find a better way to handle large files
// Limit the file size for data files to avoid performance issues
export const MAX_DATA_FILE_SIZE = 1024 * 1024 * 10
