import { describe, expect, it } from 'vitest'

import { BrowserTestFileSchema } from './index'

describe('Browser test file schema', () => {
  it('parses files containing page.close actions', () => {
    const testFile = {
      version: '1.0',
      actions: [{ method: 'page.goto', url: 'https://example.com' }, { method: 'page.close' }],
    }

    expect(BrowserTestFileSchema.safeParse(testFile).success).toBe(true)
  })

  it('rejects files containing unsupported actions', () => {
    const testFile = {
      version: '1.0',
      actions: [{ method: 'page.cloze' }],
    }

    expect(BrowserTestFileSchema.safeParse(testFile).success).toBe(false)
  })
})
