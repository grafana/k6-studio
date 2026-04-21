import './shims/http'

import httpEntrypointCore, {
  handleSummary,
  options,
} from './httpEntrypointCore'

export { handleSummary, options }

export default httpEntrypointCore
