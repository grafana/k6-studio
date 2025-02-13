// eslint-disable-next-line no-control-regex
export const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1F]/

// Limit the file size for preview to avoid performance issues
export const FILE_SIZE_PREVIEW_THRESHOLD = 1024 * 1024 * 10
