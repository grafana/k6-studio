import { InjectedScript } from '@/browser/injectedScript'
import { ActionLocator } from '@/main/runner/schema'

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
 * Find elements in the DOM using an ActionLocator.
 * Uses the same selector engine as k6 browser (Playwright) for consistent behavior.
 */
export function findElementsBySelector(
  container: HTMLElement,
  selector: ActionLocator
): Element[] {
  const script = getInjectedScript()

  let parts: { name: string; body: string }[]

  switch (selector.type) {
    case 'css':
      parts = [{ name: 'css', body: selector.selector }]
      break

    case 'testid':
      parts = [
        {
          name: 'internal:attr',
          body: `[data-testid=${JSON.stringify(selector.testId)}s]`,
        },
      ]
      break

    case 'role': {
      let body = selector.role
      if (selector.options?.name !== undefined) {
        body += `[name=${JSON.stringify(selector.options.name)}${selector.options.exact === true ? 's' : 'i'}]`
      }
      parts = [{ name: 'internal:role', body }]
      break
    }

    case 'alt':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody('alt', selector.text, selector.options?.exact),
        },
      ]
      break

    case 'label':
      parts = [
        {
          name: 'internal:label',
          body: textMatcherBody(selector.label, selector.options?.exact),
        },
      ]
      break

    case 'placeholder':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody(
            'placeholder',
            selector.placeholder,
            selector.options?.exact
          ),
        },
      ]
      break

    case 'text':
      parts = [
        {
          name: 'internal:text',
          body: textMatcherBody(selector.text, selector.options?.exact),
        },
      ]
      break

    case 'title':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody('title', selector.title, selector.options?.exact),
        },
      ]
      break

    default:
      return []
  }

  const result = script.querySelectorAll({ parts }, container)
  return typeof result === 'string' ? [] : result
}
