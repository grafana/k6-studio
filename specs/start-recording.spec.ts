import { browser, expect } from '@wdio/globals'

describe('Start recording', () => {
  it('should navigate to recorder and start recording session', async () => {
    // Navigate to the main window
    browser.waitUntil(async () => {
      return browser.electron.windowHandle !== undefined
    }, { timeout: 10000 })

    browser.switchToWindow(browser.electron.windowHandle!)

    // Click on "Record flow" link to navigate to recorder
    const recordLink = browser.$('a[href*="recorder"]')
    await recordLink.waitForDisplayed({ timeout: 20000 })
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

    await urlInput.setValue('http://localhost:9999/test')
    console.log(`✅ URL entered: http://localhost:9999/test`)

    const startButton = browser.$('button*=Start recording')
    await startButton.waitForDisplayed({ timeout: 10000 })
    
    // Wait for button to be enabled, until proxy is ready
    await browser.waitUntil(
      async () => {
        const isEnabled = await startButton.isEnabled()
        return isEnabled === true
      },
      { 
        timeout: 20000, 
        timeoutMsg: 'Start recording button did not become enabled. Proxy likely did not start.' 
      }
    )
    
    await startButton.click()
    console.log('✅ Started recording')

    const stopButton = browser.$('button*=Stop recording')
    await stopButton.waitForDisplayed({ timeout: 30000 })
    console.log('✅ Stop recording button visible')

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
    const rows = await browser.$$('table tbody tr')
    expect(rows.length).toBeGreaterThan(0)

    // Stop recording
    await stopButton.click()

    // Wait for the stop recording process to complete and check for HAR file download link
    await browser.waitUntil(
      async () => {
        try {
          const harLinks = await browser.$$('a[href$=".har"]')
          if (harLinks.length > 0) {
            return true
          }

          const stopButton = browser.$('button*=Stop recording')
          return !(await stopButton.isDisplayed())
        } catch (error) {
          return false
        }
      },
      { 
        timeout: 10000, 
        timeoutMsg: 'HAR file link not found or recording did not stop properly' 
      }
    )
    
    // Verify the HAR file link exists
    const harLinks = await browser.$$('a[href$=".har"]')
    expect(harLinks.length).toBeGreaterThan(0)
    
    const harLink = harLinks[0]
    const harHref = await harLink?.getAttribute('href') || ''
    console.log(`✅ HAR file link found: ${harHref}`)
    
    console.log('✅ Recording stopped and HAR file is available for download')
    console.log('✅ Test passed!')
  })
})
