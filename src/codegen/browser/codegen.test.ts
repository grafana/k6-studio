import { it } from 'vitest'
import { emitScript } from './codegen'

it('should emit an empty test with browser scenario options', async ({
  expect,
}) => {
  const script = await emitScript({
    defaultScenario: {
      type: 'browser',
      events: [],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/empty-browser-test.ts'
  )
})

it('should emit a console.log for every dummy event', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: {
      type: 'browser',
      events: new Array(5).fill(null).map((_, i) => ({
        type: 'page-navigation',
        eventId: String(i),
        tab: 'tab',
        url: 'http://example.com?id=' + i,
        timestamp: Date.now(),
      })),
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/emit-dummy-events.ts'
  )
})
