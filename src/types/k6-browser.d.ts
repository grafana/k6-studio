import 'k6/browser'

// k6 supports `frameLocator` on Page and FrameLocator (see
// https://grafana.com/docs/k6/latest/javascript-api/k6-browser/framelocator/),
// but @types/k6 2.0.0 declares `contentFrame` only, not `frameLocator`, so the
// browser tests we generate for iframes don't type-check without this. Remove
// once @types/k6 ships these signatures.
declare module 'k6/browser' {
  interface Page {
    frameLocator(selector: string): FrameLocator
  }

  interface FrameLocator {
    frameLocator(selector: string): FrameLocator
  }
}
