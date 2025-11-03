import { AriaRole } from 'react'

import { ElementSelector } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

export interface CssSelector {
  type: 'css'
  selector: string
}

export interface GetByRoleSelector {
  type: 'role'
  role: AriaRole
  name: string
}

interface GetByAltTextSelector {
  type: 'alt'
  text: string
}

interface GetByTestIdSelector {
  type: 'test-id'
  testId: string
}

export type NodeSelector =
  | CssSelector
  | GetByRoleSelector
  | GetByAltTextSelector
  | GetByTestIdSelector

function getRoleSelector(selectors: ElementSelector): GetByRoleSelector | null {
  if (selectors.role === undefined) {
    return null
  }

  return {
    type: 'role',
    role: selectors.role.role,
    name: selectors.role.name,
  }
}

function getAltTextSelector(
  selectors: ElementSelector
): GetByAltTextSelector | null {
  if (selectors.alt === undefined) {
    return null
  }

  return {
    type: 'alt',
    text: selectors.alt,
  }
}

function getTestIdSelector(
  selectors: ElementSelector
): GetByTestIdSelector | null {
  if (selectors.testId === undefined || selectors.testId.trim() === '') {
    return null
  }

  return {
    type: 'test-id',
    testId: selectors.testId,
  }
}

function getCssSelector(selectors: ElementSelector): CssSelector {
  return {
    type: 'css',
    selector: selectors.css,
  }
}

export function getNodeSelector(selector: ElementSelector): NodeSelector {
  return (
    getRoleSelector(selector) ??
    getAltTextSelector(selector) ??
    getTestIdSelector(selector) ??
    getCssSelector(selector)
  )
}

export function isSelectorEqual(a: NodeSelector, b: NodeSelector): boolean {
  switch (a.type) {
    case 'css':
      return b.type === 'css' && a.selector === b.selector

    case 'test-id':
      return b.type === 'test-id' && a.testId === b.testId

    case 'role':
      return b.type === 'role' && a.role === b.role && a.name === b.name

    case 'alt':
      return b.type === 'alt' && a.text === b.text

    default:
      return exhaustive(a)
  }
}
