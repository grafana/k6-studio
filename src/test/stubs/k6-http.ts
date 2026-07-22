// Stub for the `k6/http` runtime module, aliased in by vitest so the browser
// shim proxies (which import `k6/http`) can be unit tested under node. Tracking
// is disabled in tests (no K6_TRACKING_SERVER_PORT), so these are never called;
// they exist only to satisfy the import.
export default {
  asyncRequest: () => Promise.resolve(),
  post: () => ({}),
}
