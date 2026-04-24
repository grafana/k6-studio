export function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '')
}

export function getFileExtension(fileName: string) {
  return fileName.split('.').pop()
}
