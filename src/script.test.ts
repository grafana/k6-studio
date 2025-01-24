import { test } from 'vitest'
import { enhanceScript } from './script'

const shims = {
  group: `
    (function() {
      // Shim http module here
    })()
  `,
  checks: ` 
    export function handleSummary() {
      // Shim check function here
    }
  `,
}

test('inject-handleSummary', async ({ expect }) => {
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
    './__snapshots__/script/inject-handleSummary.js'
  )
})

test('handleSummary already exported', async ({ expect }) => {
  const script = `
    import { check } from "k6"

    export function handleSummary() {
      // User exported
    }

    export default function() {
      check(true, {
        'is true': value => value === true
      })
    }
  `

  const result = await enhanceScript({ script, shims })

  await expect(result).toMatchFileSnapshot(
    './__snapshots__/script/handleSummary-already-exported.js'
  )
})
