import { ipcMain, IpcMainEvent, ipcRenderer, IpcRendererEvent } from 'electron'

// Create listener and return clean up function to be used in useEffect
export function createListener<T>(
  channel: string,
  callback: (data: T) => void
) {
  const listener = (_: IpcRendererEvent, data: T) => {
    callback(data)
  }

  ipcRenderer.on(channel, listener)

  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

interface WaitForOptions {
  event: string
  signal: AbortSignal
  timeout?: number
}

export function waitFor<T>({ event, signal, timeout }: WaitForOptions) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId =
      timeout &&
      setTimeout(() => {
        ipcMain.removeListener(event, handleMessage)

        reject(new Error(`Timeout waiting for "${event}"`))
      }, timeout)

    const handleAbort = () => {
      clearTimeout(timeoutId)

      ipcMain.removeListener(event, handleMessage)

      reject(signal.reason)
    }

    const handleMessage = (_: IpcMainEvent, data: T) => {
      clearTimeout(timeoutId)

      signal.removeEventListener('abort', handleAbort)

      resolve(data)
    }

    signal.addEventListener('abort', handleAbort)

    ipcMain.once(event, handleMessage)
  })
}
