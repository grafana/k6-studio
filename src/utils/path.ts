/* eslint-disable no-restricted-imports */
import { parse } from 'pathe'

const isWindows =
  globalThis.window?.studio?.platform === 'win32' ||
  globalThis.process?.platform === 'win32'

export const sep = isWindows ? '\\' : '/'

export function toNativePath(p: string): string {
  return p.split('/').join(sep)
}

export function toPosixPath(p: string): string {
  return p.split(sep).join('/')
}

export function name(path: string): string {
  return parse(path).name
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
