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
    await urlInput.setValue('http://localhost:19999/test')
    console.log('✅ URL entered: http://localhost:19999/test')

    // Click "Start recording" button
    const startButton = browser.$('button*=Start recording')
    await startButton.waitForDisplayed({ timeout: 5000 })
    await startButton.click()
    console.log('✅ Started recording')

    // Wait for the browser to launch and "Stop recording" button to appear
    const stopButton = browser.$('button*=Stop recording')
    await stopButton.waitForDisplayed({ timeout: 30000 })
    console.log('✅ Browser launched (stop button visible)')

    // Give the browser time to navigate and make initial requests
    await browser.pause(5000)
    console.log('✅ Waited 5s for initial requests')

    // Wait for at least one request to appear in the table
    await browser.waitUntil(
      async () => {
        const rows = await browser.$$('table tbody tr')
        const rowCount = rows.length
        if (rowCount > 0) {
          console.log(`✅ Found ${rowCount} request(s) captured`)
          return true
        }
        console.log('Waiting for requests...')
        return false
      },
      { 
        timeout: 60000, 
        timeoutMsg: 'No requests captured after 60 seconds',
      }
    )

    // Verify requests are being captured
    const finalRows = await browser.$$('table tbody tr')
    expect(finalRows.length).toBeGreaterThan(0)

    // Verify "Stop recording" button is visible
    expect(await stopButton.isDisplayed()).toBe(true)
    
    console.log('✅ Test passed!')
  })
})
