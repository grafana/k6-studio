import { describe, it } from 'vitest'
import { enhanceScript } from './script'

const shims = {
  group: `
    import execution from "k6/execution"
    (function() {
      console.log("This is the groups shim")
    })()
  `,
  checks: ` 
    export function handleSummary() {
      console.log("This is the handleSummary shim")
    }
  `,
}

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

    const result = await enhanceScript({ script, shims })

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

    const result = await enhanceScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/checks-shim/handle-summary-was-exported.js'
    )
  })
})

describe('groups shim', () => {
  it('should inject groups shim when http module is imported', async ({
    expect,
  }) => {
    const script = `
      import http from "k6/http"

      export default function() {
        http.get("http://test.k6.io")
      }
    `

    const result = await enhanceScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/groups-shim/with-http-import.js'
    )
  })

  it('should not inject groups shim when http module is not imported', async ({
    expect,
  }) => {
    const script = `
      export default function() {}
    `

    const result = await enhanceScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/groups-shim/without-http-import.js'
    )
  })

  it('should not duplicate execution import if it already exists', async ({
    expect,
  }) => {
    const script = `
      import execution from "k6/execution"

      export default function() {}
    `

    const result = await enhanceScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/groups-shim/with-existing-execution-import.js'
    )
  })

  it('should not duplicate execution import if it already exists', async ({
    expect,
  }) => {
    const script = `
      import http from "k6/http"
      import execution from "k6/execution"

      export default function() {}
    `

    const result = await enhanceScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/groups-shim/with-existing-execution-import.js'
    )
  })

  it('should keep existing execution import if it has a diffrerent name', async ({
    expect,
  }) => {
    const script = `
      import http from "k6/http"
      import myExec from "k6/execution"

      export default function() {}
    `

    const result = await enhanceScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/groups-shim/with-different-alias-for-execution-import.js'
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

    const result = await enhanceScript({ script, shims })

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

    const result = await enhanceScript({ script, shims })

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

    const result = await enhanceScript({ script, shims })

    await expect(result).toMatchFileSnapshot(
      './__snapshots__/script/options-export/rename-complex-existing-options-export.js'
    )
  })
})
