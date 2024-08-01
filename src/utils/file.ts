export function getFileNameFromPath(path: string) {
  return path.split('/').pop() ?? ''
}
