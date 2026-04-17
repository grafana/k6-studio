import { LocatorOptions } from '@/schemas/browserTest/v1'

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
