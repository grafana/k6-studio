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

interface WaitForDone<T> {
  status: 'done'
  data: T
}

interface WaitForAborted {
  status: 'aborted'
}

type WaitForResult<T> = WaitForDone<T> | WaitForAborted

interface WaitForOptions {
  event: string
  signal: AbortSignal
  timeout?: number
}

export function waitFor<T>({ event, signal, timeout }: WaitForOptions) {
  return new Promise<WaitForResult<T>>((resolve, reject) => {
    const timeoutId =
      timeout &&
      setTimeout(() => {
        ipcMain.removeListener(event, handleMessage)

        reject(new Error(`Timeout waiting for "${event}"`))
      }, timeout)

    const handleAbort = () => {
      clearTimeout(timeoutId)

      ipcMain.removeListener(event, handleMessage)

      resolve({
        status: 'aborted',
      })
    }

    const handleMessage = (_: IpcMainEvent, data: T) => {
      clearTimeout(timeoutId)

      signal.removeEventListener('abort', handleAbort)

      resolve({
        status: 'done',
        data,
      })
    }

    signal.addEventListener('abort', handleAbort)

    ipcMain.once(event, handleMessage)
  })
}
