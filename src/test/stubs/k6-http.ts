// Stub for the `k6/http` runtime module, aliased in by vitest so the browser
// shim proxies (which import `k6/http`) can be unit tested under node. Tests
// that enable tracking (by setting K6_TRACKING_SERVER_PORT) spy on these to
// assert on the requests.
export default {
  // Callers check the status to tell an accepted request from a rejected one.
  asyncRequest: () => Promise.resolve({ status: 200 }),
  post: () => ({}),
}
