import type { NewLine, Node } from '../tstree'

export function trimBefore(newLine: NewLine | undefined): NewLine | undefined {
  return newLine === 'both' ? 'after' : undefined
}

export function trimAfter(newLine: NewLine | undefined): NewLine | undefined {
  return newLine === 'both' ? 'before' : undefined
}

export function mergeNewLine(
  newLine: NewLine | undefined,
  target: NewLine
): NewLine {
  if (newLine === target) {
    return newLine
  }

  if (newLine === undefined) {
    return target
  }

  return 'both'
}

export function spaceBetween<T extends Node>(nodes: T[]) {
  return nodes.map((node, index) => {
    if (index === nodes.length - 1) {
      return node
    }

    return { ...node, newLine: mergeNewLine(node.newLine, 'after') }
  })
}

export function spaceAfter<T extends Node>(nodes: T[]): T[] {
  const last = nodes[nodes.length - 1]

  if (last === undefined) {
    return []
  }

  return [
    ...nodes.slice(0, -1),
    { ...last, newLine: mergeNewLine(last.newLine, 'after') },
  ]
}

export function spaceAround<T extends Node>([first, ...rest]: T[]): T[] {
  if (first === undefined) {
    return []
  }

  const last = rest[rest.length - 1]

  if (last === undefined || last === first) {
    return [{ ...first, newLine: 'both' }]
  }

  const middle = rest.slice(0, -1)

  return [
    { ...first, newLine: mergeNewLine(first.newLine, 'before') },
    ...middle,
    { ...last, newLine: mergeNewLine(last.newLine, 'after') },
  ]
}

export function spaceBefore<T extends Node>([first, ...rest]: T[]): T[] {
  if (first === undefined) {
    return []
  }

  return [{ ...first, newLine: mergeNewLine(first.newLine, 'before') }, ...rest]
}

export function trimSpacing<T extends Node>([first, ...rest]: T[]): T[] {
  if (first === undefined) {
    return []
  }

  const last = rest[rest.length - 1]

  if (last === undefined) {
    return [{ ...first, newLine: undefined }]
  }

  return [
    { ...first, newLine: trimBefore(first.newLine) },
    ...rest.slice(0, -1),
    { ...last, newLine: trimAfter(last.newLine) },
  ]
}
