import { InjectedScript } from '@/browser/injectedScript'
import { NodeSelector } from '@/schemas/selectors'

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
 * Find elements in the DOM using a NodeSelector.
 * Uses the same selector engine as k6 browser (Playwright) for consistent behavior.
 */
export function findElementsBySelector(
  container: HTMLElement,
  selector: NodeSelector
): Element[] {
  const script = getInjectedScript()

  let parts: { name: string; body: string }[]

  switch (selector.type) {
    case 'css':
      parts = [{ name: 'css', body: selector.selector }]
      break

    case 'test-id':
      parts = [
        {
          name: 'internal:attr',
          body: `[data-testid=${JSON.stringify(selector.testId)}s]`,
        },
      ]
      break

    case 'role': {
      let body = selector.role
      if (selector.name !== undefined) {
        body += `[name=${JSON.stringify(selector.name.value)}${selector.name.exact === true ? 's' : 'i'}]`
      }
      parts = [{ name: 'internal:role', body }]
      break
    }

    case 'alt':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody('alt', selector.text.value, selector.text.exact),
        },
      ]
      break

    case 'label':
      parts = [
        {
          name: 'internal:label',
          body: textMatcherBody(selector.text.value, selector.text.exact),
        },
      ]
      break

    case 'placeholder':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody(
            'placeholder',
            selector.text.value,
            selector.text.exact
          ),
        },
      ]
      break

    case 'text':
      parts = [
        {
          name: 'internal:text',
          body: textMatcherBody(selector.text.value, selector.text.exact),
        },
      ]
      break

    case 'title':
      parts = [
        {
          name: 'internal:attr',
          body: attrBody('title', selector.text.value, selector.text.exact),
        },
      ]
      break

    default:
      return []
  }

  const result = script.querySelectorAll({ parts }, container)
  return typeof result === 'string' ? [] : result
}
