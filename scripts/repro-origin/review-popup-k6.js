import { browser } from 'k6/browser'

export const options = {
  scenarios: {
    popup: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: { browser: { type: 'chromium' } },
    },
  },
}

export default async function () {
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(__ENV.MOCK_URL)
    const opened = context.waitForEvent('page')
    await page.locator('#open').click()
    const popup = await opened
    await popup.waitForLoadState('load')
    const childText = String(
      await popup.frameLocator('#child').locator('p').textContent()
    )
    const topInjected = Boolean(
      await popup.evaluate('() => window.__K6_REPLAY_INSTALLED__ === true')
    )
    const child = popup.frames().find((frame) => frame.url().includes('/child'))
    const childInjected = Boolean(
      await child?.evaluate('() => window.__K6_REPLAY_INSTALLED__ === true')
    )
    await popup.evaluate((url) => {
      const iframe = document.createElement('iframe')
      iframe.id = 'late'
      iframe.src = url
      document.body.append(iframe)
    }, `${__ENV.MOCK_API_URL}/late`)
    const lateText = String(
      await popup.frameLocator('#late').locator('p').textContent()
    )
    await popup.locator('p').click()

    await child?.goto(`${__ENV.MOCK_API_URL}/child-alt`)
    const navigatedText = String(
      await popup.frameLocator('#child').locator('p').textContent()
    )
    await popup.locator('p').click()
    console.log(
      `K6_POPUP_RESULT ${topInjected},${childInjected},${childText === 'REPLAY_CHILD_MARKER_1399'},${lateText === 'REPLAY_LATE_MARKER_1399'},${navigatedText === 'REPLAY_NAVIGATED_MARKER_1399'}`
    )
  } finally {
    console.log('K6_BEFORE_CLOSE')
    await context.close()
    console.log('K6_AFTER_CLOSE')
  }
}
