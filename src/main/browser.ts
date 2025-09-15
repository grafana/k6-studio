interface BrowserRecordingOptions {
  prefix?: string
}

export function getBrowserRecordingArgs({
  prefix = '--',
}: BrowserRecordingOptions = {}): string[] {
  return [
    `${prefix}remote-debugging-pipe`,
    `${prefix}enable-unsafe-extension-debugging`,
    `${prefix}use-fake-device-for-media-stream`,
    `${prefix}use-fake-ui-for-media-stream`,
  ]
}
