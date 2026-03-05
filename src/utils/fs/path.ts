import * as pathe from 'pathe'

export function makeRelativePath(from: string, to: string) {
  const relativePath = pathe.relative(from, to)

  // If the file is in the same directory, then path.relative will return
  // just the filename, so we need to add the ./ prefix.
  return !relativePath.startsWith('.') ? `./${relativePath}` : relativePath
}
