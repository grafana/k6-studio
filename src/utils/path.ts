/* eslint-disable no-restricted-imports */
import { parse, resolve } from 'pathe'

const platform =
  globalThis.window?.studio?.platform ?? globalThis.process?.platform

const isWindows = platform === 'win32'
const isMac = platform === 'darwin'

// Windows (NTFS) and macOS (APFS/HFS+) default to case-insensitive file
// systems. Linux is case-sensitive. We can't detect the user's exact
// filesystem cheaply, so we assume the platform default.
const isCaseInsensitive = isWindows || isMac

export const sep = isWindows ? '\\' : '/'

export function toNativePath(p: string): string {
  return p.split('/').join(sep)
}

export function toPosixPath(p: string): string {
  return p.split(sep).join('/')
}

/**
 * Convenience function to extract the filename with extension from a path. Corresponds
 * to `path.parse(path).name`.
 */
export function name(path: string): string {
  return parse(path).name
}

/**
 * Normalize a path for comparison or use as a map key. Lower-cases on
 * platforms whose file systems are usually case-insensitive (Windows, macOS).
 */
export function key(p: string): string {
  return isCaseInsensitive ? p.toLowerCase() : p
}

/**
 * Checks two paths for equality, accounting for case-insensitivity on different
 * platforms.
 */
export function equal(a: string, b: string): boolean {
  return key(a) === key(b)
}

export function ensureWithinDirectory(
  baseDir: string,
  filePath: string
): string {
  const resolved = resolve(baseDir, filePath)
  const normalizedBase = resolve(baseDir)
  if (
    key(resolved) !== key(normalizedBase) &&
    !key(resolved).startsWith(key(normalizedBase + '/'))
  ) {
    throw new Error('Path is outside allowed directory')
  }
  return resolved
}

export {
  basename,
  delimiter,
  dirname,
  extname,
  format,
  isAbsolute,
  join,
  matchesGlob,
  normalize,
  normalizeString,
  parse,
  posix,
  relative,
  resolve,
  toNamespacedPath,
  win32,
} from 'pathe'
