import log from 'electron-log/main'

export class HttpError extends Error {
  response: Response

  constructor(message: string, response: Response) {
    super(message)

    this.name = 'HttpError'
    this.response = response
  }
}

export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

export function logError(error: unknown) {
  if (error instanceof HttpError) {
    error.response
      .json()
      .catch(() => {
        // If we failed to parse it as JSON, we'll just return the text.
        return error.response.text()
      })
      .then((body: unknown) => {
        log.error(error.message, {
          status: error.response.status,
          statusMessage: error.response.statusText,
          body,
        })
      })
      .catch(() => {
        log.error(error.message, {
          status: error.response.status,
          statusMessage: error.response.statusText,
        })
      })

    return
  }

  if (error instanceof Error) {
    log.error(error.message)

    return
  }

  log.error('An error occurred.', error)
}
