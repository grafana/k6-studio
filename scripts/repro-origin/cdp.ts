import type { CDPSession } from '@playwright/test'

import { FramePaths } from '../../src/recorder/launchers/cdp/frames'
import {
  ChromeCommand,
  ChromeDevToolsClient,
  Transport,
} from '../../src/utils/cdp/client'

export function attachFramePaths(
  session: CDPSession,
  record: ConstructorParameters<typeof FramePaths>[1]
) {
  const transport: Transport = {
    call: <Return>(command: ChromeCommand) =>
      session.send(
        command.method as Parameters<CDPSession['send']>[0],
        command.params
      ) as Promise<Return>,
    on: (method, listener) => {
      const handle = (data: unknown) => listener({ method, data } as never)
      session.on(method as Parameters<CDPSession['on']>[0], handle)
      return () =>
        session.off(method as Parameters<CDPSession['off']>[0], handle)
    },
    off: () => {},
    dispose: () => {},
  }
  return new FramePaths(new ChromeDevToolsClient(transport), record)
}
