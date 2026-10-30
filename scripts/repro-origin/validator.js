import { check } from 'k6'
import { browser } from 'k6/browser'

const replay = open(__ENV.REPLAY_PATH)
export const options = {
  scenarios: {
    mock: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: { browser: { type: 'chromium' } },
    },
  },
  thresholds: { checks: ['rate==1'] },
}

export default async function () {
  const context = await browser.newContext()
  await context.addInitScript(
    'window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = "http://localhost:0"'
  )
  await context.addInitScript(replay)
  const page = await context.newPage()
  try {
    await page.goto(__ENV.MOCK_URL)
    await page.locator('#login').click()
    await page.waitForFunction(
      () => document.querySelector('#result').textContent !== ''
    )
    const status = await page.locator('#result').textContent()
    check(status, {
      'login matches flag behavior': (value) => value === __ENV.EXPECT_STATUS,
    })
    await page.frameLocator('#cross').locator('#child').click()
    await page
      .frameLocator('#cross')
      .frameLocator('#nested')
      .locator('#child')
      .click()
    const batch = await page.evaluate(() => window.__K6_DRAIN_EVENTS__({}))
    check(batch, {
      'replay iframe capture matches flag behavior': (value) =>
        value.includes('Select this text'),
    })
    console.log(
      'MOCK_RESULT ' +
        JSON.stringify({
          status,
          replayHasChild: batch?.includes('Select this text') ?? false,
        })
    )
  } finally {
    await context.close()
  }
}
