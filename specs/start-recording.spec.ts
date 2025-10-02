import { browser, expect } from '@wdio/globals'

describe('Start recording', () => {
  it('should navigate to recorder and start recording session', async () => {
    // Navigate to the main window (not splash screen)
    const handles = await browser.getWindowHandles()
    for (const h of handles) {
      await browser.switchToWindow(h)
      const title = await browser.getTitle()
      if (title === 'Grafana k6 Studio') {
        console.log('✅ Switched to main window')
        break
      }
    }

    // Click on "Record flow" link to navigate to recorder
    const recordLink = browser.$('a[href*="recorder"]')
    await recordLink.waitForDisplayed({ timeout: 10000 })
    await recordLink.click()
    console.log('✅ Clicked recorder link')

    // Wait for recorder page to load
    await browser.waitUntil(
      async () => {
        const heading = browser.$('h1')
        const text = await heading.getText()
        return text === 'Recorder'
      },
      { timeout: 10000, timeoutMsg: 'Recorder page did not load' }
    )
    console.log('✅ Recorder page loaded')

    // Enter test URL
    const urlInput = browser.$('input[placeholder*="quickpizza"]')
    await urlInput.waitForDisplayed({ timeout: 5000 })
    await urlInput.setValue('https://quickpizza.grafana.com')
    console.log('✅ URL entered')

    // Click "Start recording" button
    const startButton = browser.$('button*=Start recording')
    await startButton.waitForDisplayed({ timeout: 5000 })
    await startButton.click()
    console.log('✅ Started recording')

    // Wait for at least one request to appear in the table
    await browser.waitUntil(
      async () => {
        const rows = await browser.$$('table tbody tr')
        console.log(`Waiting for requests... (${rows.length} rows found)`)
        return rows.length > 0
      },
      { 
        timeout: 60000, 
        timeoutMsg: 'No requests captured after 60 seconds',
        interval: 2000 // Check every 2 seconds
      }
    )
    console.log('✅ Requests captured')

    // Verify requests are being captured
    const rows = await browser.$$('table tbody tr')
    expect(rows.length).toBeGreaterThan(0)

    // Verify "Stop recording" button is visible
    const stopButton = browser.$('button*=Stop recording')
    expect(await stopButton.isDisplayed()).toBe(true)
    
    console.log('✅ Test passed!')
  })
})
