import { browser, expect } from '@wdio/globals'

describe('Start recording', () => {
  it('should navigate to recorder and start recording session', async () => {
    // Navigate to the main window
    const handles = await browser.getWindowHandles()
    const mainHandle = handles.find(async (h) => {
      await browser.switchToWindow(h)
      return (await browser.getTitle()) === 'Grafana k6 Studio'
    })
    
    if (mainHandle) {
      await browser.switchToWindow(mainHandle)
    }

    // Click on "Record flow" link to navigate to recorder
    const recordLink = browser.$('a[href*="recorder"]')
    await recordLink.click()

    // Wait for recorder page to load
    await browser.waitUntil(
      async () => {
        const heading = browser.$('h1')
        const text = await heading.getText()
        return text === 'Recorder'
      },
      { timeout: 1000, timeoutMsg: 'Recorder page did not load' }
    )

    // Enter test URL
    const urlInput = browser.$('input[placeholder*="quickpizza"]')
    await urlInput.setValue('https://quickpizza.grafana.com')

    // Click "Start recording" button
    const startButton = browser.$('button*=Start recording')
    await startButton.click()

    // Wait for at least one request to quickpizza to appear in the table
    await browser.waitUntil(
      async () => {
        const cells = await browser.$$('table tbody tr td')
        for (const cell of cells) {
          const text = await cell.getText()
          if (text.includes('quickpizza.grafana.com')) {
            return true
          }
        }
        return false
      },
      { timeout: 60000, timeoutMsg: 'No requests to quickpizza captured', interval: 1000 }
    )

    // Verify requests are being captured
    const rows = browser.$$('table tbody tr')
    expect(await rows.length).toBeGreaterThan(0)

    // Verify "Stop recording" button is visible
    const stopButton = browser.$('button*=Stop recording')
    expect(await stopButton.isDisplayed()).toBe(true)
  })
})
