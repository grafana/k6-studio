import { Correlation } from '../correlation'

// Whitelist any values extracted from HTML bodies. Maybe we should
// do something better here?
export const html = (correlation: Correlation) => {
  return correlation.from.value.selector.type === 'css'
}
