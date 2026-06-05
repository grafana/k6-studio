import { InjectedScript } from '@/browser/injectedScript'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import { isHTMLIFrameElement } from '@/utils/dom/realm'

let _injectedScript: InjectedScript | null = null

function getInjectedScript(): InjectedScript {
  if (!_injectedScript) {
    _injectedScript = new InjectedScript()
  }
  return _injectedScript
}

// exact: true → "value"s (case-sensitive exact match)
// exact: false | undefined → "value"i (case-insensitive substring match, Playwright default)
function textMatcherBody(value: string, exact?: boolean): string {
  return `${JSON.stringify(value)}${exact === true ? 's' : 'i'}`
}

function attrBody(attr: string, value: string, exact?: boolean): string {
  return `[${attr}=${JSON.stringify(value)}${exact === true ? 's' : 'i'}]`
}

/**
 * Find elements in the DOM using an ElementLocator.
 * Uses the same selector engine as k6 browser (Playwright) for consistent behavior.
 */
export function findElementsByLocator(
  container: HTMLElement,
  locator: ElementLocator
): Element[] {
  const script = getInjectedScript()

  let parts: { name: string; body: string }[]

  switch (locator.type) {
    case 'css':
      parts = [{ name: 'css', body: locator.selector }]
      break

    case 'testid':
      parts = [
        {
          name: 'internal:attr',
          body: `[data-testid=${JSON.stringify(locator.testId)}s]`,
        },
      ]
      break

    case 'role': {
      let body = locator.role
      if (locator.options?.name !== undefined) {
        body += `[name=${JSON.stringify(locator.options.name)}${locator.options.exact === true ? 's' : 'i'}]`
      }
      parts = [{ name: 'internal:role', body }]
      break
    }

    case 'alt':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody('alt', locator.text, locator.options?.exact),
        },
      ]
      break

    case 'label':
      parts = [
        {
          name: 'internal:label',
          body: textMatcherBody(locator.label, locator.options?.exact),
        },
      ]
      break

    case 'placeholder':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody(
            'placeholder',
            locator.placeholder,
            locator.options?.exact
          ),
        },
      ]
      break

    case 'text':
      parts = [
        {
          name: 'internal:text',
          body: textMatcherBody(locator.text, locator.options?.exact),
        },
      ]
      break

    case 'title':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody('title', locator.title, locator.options?.exact),
        },
      ]
      break

    default:
      return []
  }

  const result = script.querySelectorAll({ parts }, container)
  return typeof result === 'string' ? [] : result
}

/**
 * Resolves a locator that may live inside a chain of (possibly nested) iframes.
 * `frames` is ordered outermost first; each entry locates the next `<iframe>` to
 * descend into. Returns an empty array if any frame in the chain can't be found
 * or its document can't be reached.
 */
export function findElementsByFrameChain(
  root: HTMLElement,
  frames: LocatorOptions[] | undefined,
  locator: ElementLocator
): Element[] {
  let container: HTMLElement | null = root

  for (const frame of frames ?? []) {
    if (container === null) {
      return []
    }

    const frameLocator = frame.values[frame.current]

    if (frameLocator === undefined) {
      return []
    }

    const [iframe] = findElementsByLocator(container, frameLocator)
    const contentDocument = isHTMLIFrameElement(iframe)
      ? iframe.contentDocument
      : null

    container = contentDocument?.documentElement ?? null
  }

  if (container === null) {
    return []
  }

  return findElementsByLocator(container, locator)
}
