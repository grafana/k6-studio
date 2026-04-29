const isWindows =
  (globalThis.window && globalThis.window.studio.platform === 'win32') ||
  (globalThis.process && process.platform === 'win32')

export const sep = isWindows ? '\\' : '/'

function getRoot(path: string): string {
  if (isWindows) {
    const driveMatch = path.match(/^[a-zA-Z]:[/\\]/)

    if (driveMatch) {
      return driveMatch[0].replace('/', '\\')
    }

    const uncMatch = path.match(/^[/\\]{2}[^/\\]+[/\\]/)

    if (uncMatch) {
      return uncMatch[0].replace(/\//g, '\\')
    }

    return ''
  }

  return path.startsWith('/') ? '/' : ''
}

function splitParts(path: string, root: string): string[] {
  return path.slice(root.length).split(/[/\\]/).filter(Boolean)
}

export function normalize(path: string): string {
  const root = getRoot(path)
  const parts = splitParts(path, root)
  const resolved: string[] = []

  for (const part of parts) {
    if (part === '..') {
      if (resolved.length > 0) {
        resolved.pop()
      } else if (!root) {
        resolved.push('..')
      }
    } else if (part !== '.') {
      resolved.push(part)
    }
  }

  return root + resolved.join(sep) || '.'
}

export function join(...parts: string[]): string {
  return normalize(parts.join(sep))
}

export function basename(path: string, extension?: string): string {
  const root = getRoot(path)
  const parts = splitParts(path, root)

  const base = parts[parts.length - 1] ?? ''

  if (extension && base.endsWith(extension)) {
    return base.slice(0, base.length - extension.length)
  }

  return base
}

export function dirname(path: string): string {
  const root = getRoot(path)
  const parts = splitParts(path, root)

  if (parts.length <= 1) {
    return root || '.'
  }

  return root + parts.slice(0, -1).join(sep)
}

export function extname(path: string): string {
  const base = basename(path)
  const dotIndex = base.lastIndexOf('.')

  if (dotIndex <= 0) {
    return ''
  }

  return base.slice(dotIndex)
}

export function name(path: string) {
  const base = basename(path)
  const ext = extname(path)

  return base.slice(0, base.length - ext.length)
}

export function isAbsolute(path: string): boolean {
  return getRoot(path) !== ''
}

export interface ParsedPath {
  root: string
  dir: string
  base: string
  ext: string
  name: string
}

export function parse(path: string): ParsedPath {
  const root = getRoot(path)
  const base = basename(path)
  const ext = extname(path)
  const dir = dirname(path)

  const name = base.slice(0, base.length - ext.length)

  return { root, dir, base, ext, name }
}
