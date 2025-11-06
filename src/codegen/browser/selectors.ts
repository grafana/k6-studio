import { AriaRole } from 'react'

import { ElementSelector } from '@/schemas/recording'

export interface CssSelector {
  type: 'css'
  selector: string
}

export interface GetByRoleSelector {
  type: 'role'
  role: AriaRole
  name: string
}

export interface GetByTestIdSelector {
  type: 'test-id'
  testId: string
}

export type NodeSelector = CssSelector | GetByRoleSelector | GetByTestIdSelector

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

    default:
      return false
  }
}
