import log from 'electron-log/renderer'
import { createRoot } from 'react-dom/client'

import { App } from './App'

log.errorHandler.startCatching()

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
