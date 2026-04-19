import { connectStudioBridge, createBridgedStudio } from '../src/bridge/wsStudio'
import { createBrowserStudio } from '../src/web/createBrowserStudio'

const envBridge = import.meta.env.VITE_STUDIO_BRIDGE_WS
const bridgeUrl =
  envBridge && envBridge.length > 0
    ? envBridge
    : 'ws://127.0.0.1:9756'

const offlineStudio = createBrowserStudio()

async function bootstrap() {
  const ws = await connectStudioBridge(bridgeUrl)
  ;(window as Window).studio = ws
    ? createBridgedStudio(ws, offlineStudio)
    : offlineStudio

  await import('../src/renderer')
}

await bootstrap()
