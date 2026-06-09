/* eslint-disable no-restricted-imports */
import { parse } from 'pathe'

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

/**
 * A Map whose keys are automatically normalized via `path.key()`, so lookups
 * are case-insensitive on macOS and Windows regardless of how the caller
 * spells the path.
 */
export class PathMap<V> extends Map<string, V> {
  constructor(entries?: Iterable<readonly [string, V]> | null) {
    super()
    if (entries) {
      for (const [k, v] of entries) {
        this.set(key(k), v)
      }
    }
  }

  override get(k: string): V | undefined {
    return super.get(key(k))
  }

  override set(k: string, v: V): this {
    return super.set(key(k), v)
  }

  override has(k: string): boolean {
    return super.has(key(k))
  }

  override delete(k: string): boolean {
    return super.delete(key(k))
  }
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
