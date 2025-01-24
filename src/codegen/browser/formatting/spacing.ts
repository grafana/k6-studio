import type { TSESTree as ts } from '@typescript-eslint/types'

export function trimBefore(
  newLine: ts.NewLine | undefined
): ts.NewLine | undefined {
  return newLine === 'both' ? 'after' : undefined
}

export function trimAfter(
  newLine: ts.NewLine | undefined
): ts.NewLine | undefined {
  return newLine === 'both' ? 'before' : undefined
}

export function mergeNewLine(
  newLine: ts.NewLine | undefined,
  target: ts.NewLine
): ts.NewLine {
  if (newLine === target) {
    return newLine
  }

  if (newLine === undefined) {
    return target
  }

  return 'both'
}

export function spaceBetween<T extends ts.Node>(nodes: T[]) {
  return nodes.map((node, index) => {
    if (index === nodes.length - 1) {
      return node
    }

    return { ...node, newLine: mergeNewLine(node.newLine, 'after') }
  })
}

export function spaceAfter<T extends ts.Node>(nodes: T[]): T[] {
  const last = nodes[nodes.length - 1]

  if (last === undefined) {
    return []
  }

  return [
    ...nodes.slice(0, -1),
    { ...last, newLine: mergeNewLine(last.newLine, 'after') },
  ]
}

export function spaceAround<T extends ts.Node>([first, ...rest]: T[]): T[] {
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

export function spaceBefore<T extends ts.Node>([first, ...rest]: T[]): T[] {
  if (first === undefined) {
    return []
  }

  return [{ ...first, newLine: mergeNewLine(first.newLine, 'before') }, ...rest]
}

export function trimSpacing<T extends ts.Node>([first, ...rest]: T[]): T[] {
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
