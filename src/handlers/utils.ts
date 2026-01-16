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

      const reason: unknown = signal.reason
      if (reason instanceof Error) {
        reject(reason)
        return
      }

      const message = (() => {
        if (typeof reason === 'string') {
          return reason
        }

        if (reason === null || reason === undefined) {
          return 'Aborted'
        }

        try {
          return JSON.stringify(reason)
        } catch {
          return Object.prototype.toString.call(reason)
        }
      })()

      reject(new Error(message))
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
