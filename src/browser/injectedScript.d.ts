interface SelectorPart {
  name: string
  body: string
}

interface ParsedSelector {
  parts: SelectorPart[]
  capture?: number
}

declare class InjectedScript {
  querySelectorAll(
    selector: ParsedSelector,
    root: Document | Element | ShadowRoot
  ): Element[] | string
}

export { InjectedScript }
