// Stub for the `k6/browser` runtime module, aliased in by vitest so the browser
// shim (which mutates the `browser` singleton on import) can be unit tested
// under node. Tests spy on these members to hand out fake pages and contexts.
export const browser = {
  newPage: () => Promise.resolve(null),
  newContext: () => Promise.resolve(null),
  context: () => null,
}

export default { browser }
