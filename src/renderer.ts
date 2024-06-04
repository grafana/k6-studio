/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css'
import { ProxyData } from './lib/types'

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
)

// Proxy

window.studio.proxy.onProxyStarted(() => {
  console.log('proxy launched')
})

document.getElementById('launch_proxy').addEventListener('click', () => {
  window.studio.proxy.launchProxy()
  console.log('launch proxy event sent')
})

document.getElementById('stop_proxy').addEventListener('click', () => {
  window.studio.proxy.stopProxy()
  console.log('stop proxy event sent')
})

window.studio.proxy.onProxyData((data: ProxyData) => {
  console.log(data)

  const list = document.getElementById('requests_list')
  const listElement = document.createElement('li')
  listElement.innerHTML = `<pre>method: ${data.request.method} host: ${data.request.host} path: ${data.request.path}</pre>`
  list.appendChild(listElement)
})

// Browser

window.studio.browser.onBrowserStarted(() => {
  console.log('browser launched')
})

document.getElementById('launch_browser').addEventListener('click', () => {
  window.studio.browser.launchBrowser()
  console.log('launch browser event sent')
})

document.getElementById('stop_browser').addEventListener('click', () => {
  window.studio.browser.stopBrowser()
  console.log('stop browser event sent')
})
