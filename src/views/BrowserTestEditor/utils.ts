import { LocatorOptions } from './types'

export function createDefaultLocatorOptions(): LocatorOptions {
  return {
    current: 'css',
    values: {
      css: {
        type: 'css',
        selector: '',
      },
    },
  }
}
