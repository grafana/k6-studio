import log from 'electron-log/renderer'
import { createRoot } from 'react-dom/client'

import type { Studio } from '@/preload'
import { createBrowserStudio } from '@/web/createBrowserStudio'

import { App } from './App'

// Electron preload sets `window.studio`. Opening the Vite dev URL in a plain browser
// skips preload — install the same offline stub `web-entry.ts` uses so the UI can mount.
const win = window as Window & { studio?: Studio }
if (!win.studio) {
  win.studio = createBrowserStudio()
}

log.errorHandler.startCatching()

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
