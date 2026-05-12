const locatorDetail = Symbol('Locator')
const pageDetail = Symbol('Page')

declare global {
  interface SymbolConstructor {
    locatorDetail: typeof locatorDetail
    pageDetail: typeof pageDetail
  }
}

// Store the symbols on the global Symbol. The nullish assignment ensures that
// if multiple versions of this module are loaded from different bundles, they
// will all use the same  symbols and thus be able to recognize the proxied objects.
Symbol.locatorDetail = Symbol.locatorDetail ?? locatorDetail
Symbol.pageDetail = Symbol.pageDetail ?? pageDetail

export {}
