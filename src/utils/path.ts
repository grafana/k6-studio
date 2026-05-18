/* eslint-disable no-restricted-imports */
import nativePath from 'node:path'
import { parse } from 'pathe'

export function toNativePath(p: string): string {
  return p.split('/').join(nativePath.sep)
}

export function name(path: string): string {
  return parse(path).name
}

export const native = nativePath

export * from 'pathe'
