import type { TSESTree as ts } from '@typescript-eslint/types'

export function trimBefore(
  newLine: ts.NewLine | undefined
): ts.NewLine | undefined {
  if (newLine === undefined) {
    return undefined
  }

  return {
    ...newLine,
    before: newLine.before === true ? false : newLine.before,
  }
}

export function trimAfter(
  newLine: ts.NewLine | undefined
): ts.NewLine | undefined {
  if (newLine === undefined) {
    return undefined
  }

  return {
    ...newLine,
    after: newLine.after === true ? false : newLine.after,
  }
}

export function mergeNewLine(
  target: ts.NewLine | undefined,
  newLine: ts.NewLine
): ts.NewLine {
  if (target === undefined) {
    return newLine
  }

  const before =
    newLine.before !== undefined
      ? target.before === 'never'
        ? 'never'
        : newLine.before
      : target.before

  const after =
    newLine.after !== undefined
      ? target.after === 'never'
        ? 'never'
        : newLine.after
      : target.after

  return { before, after }
}

export function spaceBetween<T extends ts.Node>(nodes: T[]) {
  return nodes.map((node, index) => {
    const nextNode = nodes[index + 1]

    if (nextNode === undefined || nextNode.newLine?.before === 'never') {
      return node
    }

    return { ...node, newLine: mergeNewLine(node.newLine, { after: true }) }
  })
}

export function spaceAfter<T extends ts.Node>(nodes: T[]): T[] {
  const last = nodes[nodes.length - 1]

  if (last === undefined) {
    return []
  }

  return [
    ...nodes.slice(0, -1),
    { ...last, newLine: mergeNewLine(last.newLine, { after: true }) },
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
    { ...first, newLine: mergeNewLine(first.newLine, { before: true }) },
    ...middle,
    { ...last, newLine: mergeNewLine(last.newLine, { after: true }) },
  ]
}

export function spaceBefore<T extends ts.Node>([first, ...rest]: T[]): T[] {
  if (first === undefined) {
    return []
  }

  return [
    { ...first, newLine: mergeNewLine(first.newLine, { before: true }) },
    ...rest,
  ]
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
