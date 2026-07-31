import { describe, expect, it } from 'vitest'

import { BrowserTestFileCodec } from '.'

import { migrateBrowserTestFile } from './migration'

describe('migrateBrowserTestFile', () => {
  it('adds type: element to action locators missing the type field', () => {
    const oldFile = {
      version: '1.0' as const,
      actions: [
        {
          id: '1',
          method: 'locator.click',
          locator: {
            key: 'abc',
            current: 'css',
            values: { css: { type: 'css', selector: '#btn' } },
          },
        },
      ],
      options: {},
    }

    const result = migrateBrowserTestFile(oldFile as never)

    expect(result.actions[0]).toMatchObject({
      locator: {
        type: 'element',
        key: 'abc',
        current: 'css',
        values: { css: { type: 'css', selector: '#btn' } },
      },
    })
  })

  it('converts flat frames array to recursive parent chain', () => {
    const oldFile = {
      version: '1.0' as const,
      actions: [
        {
          id: '1',
          method: 'locator.fill',
          value: 'hello',
          locator: {
            key: 'elem-key',
            current: 'css',
            values: { css: { type: 'css', selector: 'input' } },
          },
          frames: [
            {
              key: 'frame-outer',
              current: 'css',
              values: { css: { type: 'css', selector: '#outer-frame' } },
            },
            {
              key: 'frame-inner',
              current: 'css',
              values: { css: { type: 'css', selector: '#inner-frame' } },
            },
          ],
        },
      ],
      options: {},
    }

    const result = migrateBrowserTestFile(oldFile as never)

    expect(result.actions[0]).not.toHaveProperty('frames')
    expect(result.actions[0]).toMatchObject({
      locator: {
        type: 'element',
        key: 'elem-key',
        parent: {
          type: 'frame',
          key: 'frame-outer',
          current: 'css',
          values: { css: { type: 'css', selector: '#outer-frame' } },
          parent: {
            type: 'frame',
            key: 'frame-inner',
            current: 'css',
            values: { css: { type: 'css', selector: '#inner-frame' } },
          },
        },
      },
    })
  })

  it('preserves actions without locators (page actions)', () => {
    const oldFile = {
      version: '1.0' as const,
      actions: [
        { id: '1', method: 'page.goto', url: 'https://example.com' },
        { id: '2', method: 'page.waitForTimeout', timeout: 3000 },
      ],
      options: {},
    }

    const result = migrateBrowserTestFile(oldFile as never)

    expect(result.actions).toEqual(oldFile.actions)
  })

  it('does not modify locators that already have type field', () => {
    const newFile = {
      version: '1.0' as const,
      actions: [
        {
          id: '1',
          method: 'locator.click',
          locator: {
            type: 'element',
            key: 'abc',
            current: 'css',
            values: { css: { type: 'css', selector: '#btn' } },
            parent: {
              type: 'frame',
              key: 'frame-1',
              current: 'css',
              values: { css: { type: 'css', selector: 'iframe' } },
            },
          },
        },
      ],
      options: {},
    }

    const result = migrateBrowserTestFile(newFile as never)

    expect(result.actions[0]).toMatchObject({
      locator: {
        type: 'element',
        parent: { type: 'frame' },
      },
    })
  })

  it('ignores frames array when parent chain already exists', () => {
    const mixedFile = {
      version: '1.0' as const,
      actions: [
        {
          id: '1',
          method: 'locator.click',
          locator: {
            type: 'element',
            key: 'abc',
            current: 'css',
            values: { css: { type: 'css', selector: '#btn' } },
            parent: {
              type: 'frame',
              key: 'f',
              current: 'css',
              values: { css: { type: 'css', selector: 'iframe' } },
            },
          },
          frames: [
            {
              key: 'stale',
              current: 'css',
              values: { css: { type: 'css', selector: '.old' } },
            },
          ],
        },
      ],
      options: {},
    }

    const result = migrateBrowserTestFile(mixedFile as never)

    expect(result.actions[0]).toMatchObject({
      locator: {
        parent: { key: 'f' },
      },
    })
    expect(result.actions[0]).not.toHaveProperty('frames')
  })
})

describe('BrowserTestFileCodec', () => {
  it('decodes old format files without type field', () => {
    const oldFileJson = JSON.stringify({
      version: '1.0',
      actions: [
        {
          id: 'a1',
          method: 'locator.click',
          locator: {
            current: 'css',
            values: { css: { type: 'css', selector: '#submit' } },
          },
        },
      ],
      options: {
        loadProfile: {
          executor: 'shared-iterations',
          vus: 1,
          iterations: 1,
        },
        thresholds: [],
        loadZones: [],
      },
    })

    const result = BrowserTestFileCodec.decode(oldFileJson)

    expect(result.actions[0]).toMatchObject({
      locator: {
        type: 'element',
        current: 'css',
        values: { css: { type: 'css', selector: '#submit' } },
      },
    })
  })

  it('decodes new format files with type field', () => {
    const newFileJson = JSON.stringify({
      version: '1.0',
      actions: [
        {
          id: 'a1',
          method: 'locator.click',
          locator: {
            type: 'element',
            current: 'css',
            values: { css: { type: 'css', selector: '#submit' } },
          },
        },
      ],
      options: {
        loadProfile: {
          executor: 'shared-iterations',
          vus: 1,
          iterations: 1,
        },
        thresholds: [],
        loadZones: [],
      },
    })

    const result = BrowserTestFileCodec.decode(newFileJson)

    expect(result.actions[0]).toMatchObject({
      locator: {
        type: 'element',
        current: 'css',
      },
    })
  })

  it('decodes old format with frames array to parent chain', () => {
    const oldFileJson = JSON.stringify({
      version: '1.0',
      actions: [
        {
          id: 'a1',
          method: 'locator.fill',
          value: 'test',
          locator: {
            current: 'css',
            values: { css: { type: 'css', selector: 'input' } },
          },
          frames: [
            {
              current: 'css',
              values: { css: { type: 'css', selector: '#frame1' } },
            },
          ],
        },
      ],
      options: {
        loadProfile: {
          executor: 'shared-iterations',
          vus: 1,
          iterations: 1,
        },
        thresholds: [],
        loadZones: [],
      },
    })

    const result = BrowserTestFileCodec.decode(oldFileJson)

    expect(result.actions[0]).toMatchObject({
      method: 'locator.fill',
      locator: {
        type: 'element',
        current: 'css',
        parent: {
          type: 'frame',
          current: 'css',
          values: { css: { type: 'css', selector: '#frame1' } },
        },
      },
    })
  })
})
