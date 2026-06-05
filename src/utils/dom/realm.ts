/**
 * Realm-safe DOM type guards.
 *
 * An element inside an iframe belongs to that frame's realm, so checking it with
 * the top window's constructor (`element instanceof HTMLInputElement`) returns
 * `false`. These guards inspect the element structurally (its HTML tag name)
 * instead of using `instanceof`, so they work regardless of which frame the
 * element lives in, and even for a detached node whose document has lost its
 * browsing context. The recorder and session replay both deal with elements from
 * nested frames, where a bare `instanceof` silently misclassifies them.
 */

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'

/**
 * Structural check for any DOM element, usable across realms (a cross-realm
 * element fails `instanceof Element`). Distinguishes an element from a plain
 * object such as a locator.
 */
export function isElement(value: unknown): value is Element {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Node).nodeType === 1 /* Node.ELEMENT_NODE */
  )
}

/**
 * True when `node` is an HTML element with the given lowercase tag name. Matches
 * `instanceof`'s HTML-only semantics (an SVG element of the same local name is
 * rejected) without depending on any window's constructor.
 */
function isHtmlElement(node: Node | null | undefined, localName: string) {
  return (
    isElement(node) &&
    node.namespaceURI === HTML_NAMESPACE &&
    node.localName === localName
  )
}

export function isHTMLInputElement(
  node: Node | null | undefined
): node is HTMLInputElement {
  return isHtmlElement(node, 'input')
}

export function isHTMLButtonElement(
  node: Node | null | undefined
): node is HTMLButtonElement {
  return isHtmlElement(node, 'button')
}

export function isHTMLSelectElement(
  node: Node | null | undefined
): node is HTMLSelectElement {
  return isHtmlElement(node, 'select')
}

export function isHTMLTextAreaElement(
  node: Node | null | undefined
): node is HTMLTextAreaElement {
  return isHtmlElement(node, 'textarea')
}

export function isHTMLLabelElement(
  node: Node | null | undefined
): node is HTMLLabelElement {
  return isHtmlElement(node, 'label')
}

export function isHTMLAnchorElement(
  node: Node | null | undefined
): node is HTMLAnchorElement {
  return isHtmlElement(node, 'a')
}

export function isHTMLImageElement(
  node: Node | null | undefined
): node is HTMLImageElement {
  return isHtmlElement(node, 'img')
}

export function isHTMLIFrameElement(
  node: Node | null | undefined
): node is HTMLIFrameElement {
  return isHtmlElement(node, 'iframe')
}
