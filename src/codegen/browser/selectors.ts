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

export interface GetByAltTextSelector {
  type: 'alt'
  text: string
}

export interface GetByLabelSelector {
  type: 'label'
  text: string
}

export interface GetByPlaceholderSelector {
  type: 'placeholder'
  text: string
}

export interface GetByTitleSelector {
  type: 'title'
  text: string
}

export interface GetByTestIdSelector {
  type: 'test-id'
  testId: string
}

export type NodeSelector =
  | CssSelector
  | GetByRoleSelector
  | GetByAltTextSelector
  | GetByLabelSelector
  | GetByPlaceholderSelector
  | GetByTitleSelector
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

function getLabelSelector(
  selectors: ElementSelector
): GetByLabelSelector | null {
  if (selectors.label === undefined) {
    return null
  }

  return {
    type: 'label',
    text: selectors.label,
  }
}

function getPlaceholderSelector(
  selectors: ElementSelector
): GetByPlaceholderSelector | null {
  if (selectors.placeholder === undefined) {
    return null
  }

  return {
    type: 'placeholder',
    text: selectors.placeholder,
  }
}

function getTitleSelector(
  selectors: ElementSelector
): GetByTitleSelector | null {
  if (selectors.title === undefined) {
    return null
  }

  return {
    type: 'title',
    text: selectors.title,
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
    getLabelSelector(selector) ??
    getAltTextSelector(selector) ??
    getPlaceholderSelector(selector) ??
    getTitleSelector(selector) ??
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

    case 'label':
      return b.type === 'label' && a.text === b.text

    case 'placeholder':
      return b.type === 'placeholder' && a.text === b.text

    case 'title':
      return b.type === 'title' && a.text === b.text

    default:
      return exhaustive(a)
  }
}
