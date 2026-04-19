/**
 * Delivers ScriptHandler IPC events to either a BrowserWindow renderer or a web bridge client.
 */
export interface ScriptIpcSink {
  send(channel: string, ...args: unknown[]): void
}
