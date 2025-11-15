import { browser, expect } from '@wdio/globals'

describe('Launches the application', () => {
  it('should show main window', async () => {
    const [mainHandle] = await browser.getWindowHandles()
    await browser.switchToWindow(mainHandle!)

    expect(await browser.getTitle()).toBe('Grafana k6 Studio')

    const welcomeMessage = browser.$('h1')
    expect(await welcomeMessage.getText()).toBe(
      'Discover what you can do with Grafana k6 Studio'
    )
  })
})
