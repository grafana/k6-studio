import { browser, expect } from '@wdio/globals'

describe('Launches the application', () => {
  it('should show main window', async () => {
    browser.waitUntil(
      async () => {
        return browser.electron.windowHandle !== undefined
      },
      { timeout: 10000 }
    )

    browser.switchToWindow(browser.electron.windowHandle!)

    expect(await browser.getTitle()).toBe('Grafana k6 Studio')

    const welcomeMessage = browser.$('h1')
    expect(await welcomeMessage.getText()).toBe(
      'Discover what you can do with Grafana k6 Studio'
    )
  })
})
