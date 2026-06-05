import { finder } from '@medv/finder'

import { InjectedScript } from '@/browser/injectedScript'
import {
  AriaDetails,
  BrowserEventTarget,
  ElementSelector,
  RoleElementSelector,
} from '@/schemas/recording'

import { getAriaDetails } from './aria'

let _injectedScript: InjectedScript | null = null

function getInjectedScript(): InjectedScript {
  if (!_injectedScript) {
    _injectedScript = new InjectedScript()
  }
  return _injectedScript
}

function queryAll(
  document: Document,
  parts: { name: string; body: string }[]
): Element[] {
  const result = getInjectedScript().querySelectorAll({ parts }, document.body)

  return typeof result === 'string' ? [] : result
}

function generateRoleSelector(
  element: Element,
  { roles, name }: AriaDetails
): RoleElementSelector | undefined {
  const { HTMLElement } = element.ownerDocument.defaultView ?? window

  if (element instanceof HTMLElement === false) {
    return
  }

  const applicableRoles = roles.filter((role) => role !== 'generic')

  if (applicableRoles.length === 0) {
    return undefined
  }

  if (name === undefined || name.trim() === '') {
    return undefined
  }

  const [selector] = applicableRoles.flatMap((role) => {
    const matches = queryAll(element.ownerDocument, [
      {
        name: 'internal:role',
        body: `${role}[name=${JSON.stringify(name)}s]`,
      },
    ])

    if (!matches.includes(element)) {
      return []
    }

    if (matches.length > 1) {
      return []
    }

    return {
      role,
      name,
    }
  })

  return selector
}

function generateAltTextSelector(element: Element): string | undefined {
  const { HTMLImageElement, HTMLAreaElement, HTMLInputElement } =
    element.ownerDocument.defaultView ?? window

  if (
    element instanceof HTMLImageElement === false &&
    element instanceof HTMLAreaElement === false &&
    element instanceof HTMLInputElement === false
  ) {
    return undefined
  }

  if (element instanceof HTMLInputElement && element.type !== 'image') {
    return undefined
  }

  const alt = element.alt.trim()

  if (alt === '') {
    return undefined
  }

  const matches = queryAll(element.ownerDocument, [
    { name: 'internal:attr', body: `[alt=${JSON.stringify(alt)}s]` },
  ])

  if (matches.length !== 1) {
    return undefined
  }

  return alt
}

function generateLabelSelector(
  element: Element,
  { labels }: AriaDetails
): string | undefined {
  const { HTMLElement } = element.ownerDocument.defaultView ?? window

  if (element instanceof HTMLElement === false) {
    return undefined
  }

  for (const label of labels) {
    const trimmed = label.trim()

    const matches = queryAll(element.ownerDocument, [
      { name: 'internal:label', body: `${JSON.stringify(trimmed)}s` },
    ])

    if (!matches.includes(element)) {
      continue
    }

    if (matches.length > 1) {
      continue
    }

    return trimmed
  }

  return undefined
}

function generatePlaceholderSelector(element: Element): string | undefined {
  const { HTMLInputElement, HTMLTextAreaElement } =
    element.ownerDocument.defaultView ?? window

  if (
    element instanceof HTMLInputElement === false &&
    element instanceof HTMLTextAreaElement === false
  ) {
    return undefined
  }

  const placeholder = element.placeholder.trim()

  if (placeholder === '') {
    return undefined
  }

  const matches = queryAll(element.ownerDocument, [
    {
      name: 'internal:attr',
      body: `[placeholder=${JSON.stringify(placeholder)}s]`,
    },
  ])

  if (matches.length !== 1) {
    return undefined
  }

  if (!matches.includes(element)) {
    return undefined
  }

  return placeholder
}

function generateTitleSelector(element: Element): string | undefined {
  const { HTMLElement } = element.ownerDocument.defaultView ?? window

  if (element instanceof HTMLElement === false) {
    return undefined
  }

  const title = element.title.trim()

  if (title === '') {
    return undefined
  }

  const matches = queryAll(element.ownerDocument, [
    { name: 'internal:attr', body: `[title=${JSON.stringify(title)}s]` },
  ])

  if (matches.length !== 1) {
    return undefined
  }

  if (!matches.includes(element)) {
    return undefined
  }

  return title
}

function generateTestIdSelector(element: Element): string | undefined {
  const { HTMLElement } = element.ownerDocument.defaultView ?? window

  if (element instanceof HTMLElement === false) {
    return undefined
  }

  const testId = element.getAttribute('data-testid')

  if (testId === null || testId.trim() === '') {
    return undefined
  }

  const matches = queryAll(element.ownerDocument, [
    { name: 'internal:attr', body: `[data-testid=${JSON.stringify(testId)}s]` },
  ])

  if (matches.length > 1 || !matches.includes(element)) {
    return undefined
  }

  return testId
}

export function getCssSelector(element: Element): string {
  return finder(element, {
    root: element.ownerDocument.documentElement,
  })
}

export function generateSelectors(
  element: Element,
  aria: AriaDetails
): ElementSelector {
  return {
    css: getCssSelector(element),
    testId: generateTestIdSelector(element),
    alt: generateAltTextSelector(element),
    label: generateLabelSelector(element, aria),
    placeholder: generatePlaceholderSelector(element),
    title: generateTitleSelector(element),
    role: generateRoleSelector(element, aria),
  }
}

export function getElementDetails(element: Element): BrowserEventTarget {
  const aria = getAriaDetails(element)

  return {
    selectors: generateSelectors(element, aria),
    aria,
  }
}
