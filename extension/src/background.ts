import { browser } from 'webextension-polyfill-ts'

browser.runtime.onStartup.addListener(() => {
  console.log('Extension started...')
})
