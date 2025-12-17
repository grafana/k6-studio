import { afterAll, beforeAll, describe, it, vi } from 'vitest'

import { instrumentScript } from './instrumentation'

const shims = {
  checks: ` 
    export function handleSummary() {
      console.log("This is the handleSummary shim")
    }
  `,
}

beforeAll(() => {
  vi.mock('electron', () => {
    return {
      app: {
        getAppPath() {
          return '/mock'
        },
      },
    }
  })
})

afterAll(() => {
  vi.clearAllMocks()
})

describe('checks shim', () => {
  it('should inject handleSummary export', async ({ expect }) => {
    const script = `
      import { check } from "k6"

      export default function() {
        check(true, {
          'is true': value => value === true
        })
      }
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/checks-shim/handle-summary-was-not-exported.js'
    )
  })

  it('should not inject handleSummary export when it has already been exported', async ({
    expect,
  }) => {
    const script = `
      import { check } from "k6"

      export function handleSummary() {
        console.log("This is the user-defined handleSummary function")
      }

      export default function() {
        check(true, {
          'is true': value => value === true
        })
      }
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/checks-shim/handle-summary-was-exported.js'
    )
  })
})

describe('http shim', () => {
  it('should replace k6/http import with http shim path', async ({
    expect,
  }) => {
    const script = `
      import http from "k6/http"

      export default function() {
        http.get("http://test.k6.io")
      }
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/http-shim/with-http-import.js'
    )
  })

  it('should replace k6/http import with named imports', async ({ expect }) => {
    const script = `
      import { get, post } from "k6/http"

      export default function() {
        get("http://test.k6.io")
        post("http://test.k6.io", JSON.stringify({ data: 'test' }))
      }
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/http-shim/with-named-imports.js'
    )
  })

  it('should replace k6/http import with alias', async ({ expect }) => {
    const script = `
      import myHttp from "k6/http"

      export default function() {
        myHttp.get("http://test.k6.io")
      }
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/http-shim/with-http-alias.js'
    )
  })

  it('should not replace import when http module is not imported', async ({
    expect,
  }) => {
    const script = `
      export default function() {
        console.log("No http import")
      }
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/http-shim/without-http-import.js'
    )
  })
})

describe('options export', () => {
  it('should export options object when no options are exported', async ({
    expect,
  }) => {
    const script = `
      export default function() {}
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/options-export/options-export.js'
    )
  })

  it('should rename any existing options export to avoid collision with the inject one', async ({
    expect,
  }) => {
    const script = `
      export const options = {
        vus: 10,
        duration: "10s"
      }

      export default function() {}
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/options-export/rename-existing-options-export.js'
    )
  })

  it('should rename options export when exported in a complex way', async ({
    expect,
  }) => {
    const script = `
      export const {
        abc: options
      } = {
        options: {
          vus: 10,
          duration: "10s"
        }
      } 

      export default function() {}
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/options-export/rename-complex-existing-options-export.js'
    )
  })
})

describe('browser options', () => {
  it('should inject browser options when browser module is imported', async ({
    expect,
  }) => {
    const script = `
      import browser from "k6/browser"

      export default function() {
      }
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/browser-options/with-browser-import.js'
    )
  })

  it('should not inject browser options when browser module is not imported', async ({
    expect,
  }) => {
    const script = `
      export default function() {
      }
    `

    const result = await instrumentScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/browser-options/without-browser-import.js'
    )
  })
})
