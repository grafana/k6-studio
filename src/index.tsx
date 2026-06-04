import log from 'electron-log/renderer'
import { createRoot } from 'react-dom/client'

import { App } from './App'

// Must register before electron-log to suppress benign ResizeObserver
// warnings triggered by Radix UI during layout shifts.
window.addEventListener('error', (event) => {
  if (event.message?.includes('ResizeObserver loop')) {
    event.stopImmediatePropagation()
  }
})

log.errorHandler.startCatching()

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
