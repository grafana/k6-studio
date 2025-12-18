// Import shims first to mutate k6 modules globally
import './shims/http'
import './shims/browser'

// @ts-expect-error - Path will be replaced at runtime
// eslint-disable-next-line import/no-unresolved
import * as userScript from '__USER_SCRIPT_PATH__'

export default async function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await userScript['default']()
}

export { handleSummary } from './summary'
