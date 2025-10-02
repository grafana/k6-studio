import { browser, expect } from '@wdio/globals'

describe('Launches the application', () => {
  it('should main window', async () => {
    const handles = await browser.getWindowHandles()
    const mainHandle = handles.find(
      async (h) => {
        await browser.switchToWindow(h)
        return (await browser.getTitle() === 'Grafana k6 Studio')
      }
    )
   
    expect(mainHandle).toBeDefined()
  })
})
