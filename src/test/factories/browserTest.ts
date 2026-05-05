import {
  BrowserTestFile,
  BrowserTestOptions,
  defaultBrowserTestOptions,
} from '@/schemas/browserTest'

export function createBrowserTestOptions(
  overrides?: Partial<BrowserTestOptions>
): BrowserTestOptions {
  return { ...defaultBrowserTestOptions, ...overrides }
}

export function createBrowserTestFile(
  overrides?: Partial<BrowserTestFile>
): BrowserTestFile {
  return {
    version: '1.0',
    actions: [],
    options: defaultBrowserTestOptions,
    ...overrides,
  }
}
