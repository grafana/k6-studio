import { browser } from '@wdio/globals'
import { expect } from 'expect-webdriverio'
import { describe, it } from 'mocha'

async function listWindows() {
  const handles = await browser.getWindowHandles()
  const metas = []
  for (const h of handles) {
    await browser.switchToWindow(h)
    metas.push({
      handle: h,
      title: await browser.getTitle(),
      url: await browser.getUrl(),
    })
  }
  return metas
}

describe('Launches the application', () => {
  it('should show splash screen and main window', async () => {
    const windows = await listWindows()

    await browser.waitUntil(
      async () => {
        const windows = await listWindows()
        return windows.length === 2
      },
      { timeout: 10000 }
    )

    const splashScreen = windows.find(
      (window) => window.title === 'Grafana k6 Studio - Splash Screen'
    )
    const mainWindow = windows.find(
      (window) => window.title === 'Grafana k6 Studio'
    )
    console.log('splashScreen', splashScreen)
    console.log('mainWindow', mainWindow)

    await expect(splashScreen).toBeDefined()
    await expect(mainWindow).toBeDefined()
  })
})
