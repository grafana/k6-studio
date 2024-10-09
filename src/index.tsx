import { createRoot } from 'react-dom/client'
import { App } from './App'
import log from 'electron-log/renderer'

log.errorHandler.startCatching()

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
