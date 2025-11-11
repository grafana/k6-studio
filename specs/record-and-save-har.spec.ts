import { browser, expect } from '@wdio/globals'

describe('Start recording', () => {
  it('should navigate to recorder and start recording session', async () => {
    // Navigate to the main window
    const [mainHandle] = await browser.getWindowHandles()
    await browser.switchToWindow(mainHandle!)

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
        timeoutMsg:
          'Start recording button did not become enabled. Proxy likely did not start.',
      }
    )

    await startButton.click()
    console.log('✅ Started recording')

    // Wait for at least one request to appear in the table
    await browser.waitUntil(
      async () => {
        const rows = browser.$$('table tbody tr')
        const rowCount = await rows.length
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
    const rows = browser.$$('table tbody tr')
    expect(await rows.length).toBeGreaterThan(0)

    // Stop recording
    const stopButton = browser.$('button*=Stop recording')
    await stopButton.click()
    console.log('✅ Stopped recording')

    // Wait for the stop recording process to complete and check that the HAR file exists in the sidebar
    await browser.waitUntil(
      async () => {
        try {
          const harLinks = browser.$$('a[href$=".har"]')
          if ((await harLinks.length) > 0) {
            return true
          }

          return !(await stopButton.isDisplayed())
        } catch (error) {
          return false
        }
      },
      {
        timeout: 10000,
        timeoutMsg:
          'HAR file link not found or recording did not stop properly',
      }
    )

    const harLinks = browser.$$('a[href$=".har"]')
    expect(await harLinks.length).toBeGreaterThan(0)

    const harLink = harLinks[0]
    const harHref = (await harLink?.getAttribute('href')) || ''
    console.log(`✅ HAR file generated: ${harHref}`)
  })
})
