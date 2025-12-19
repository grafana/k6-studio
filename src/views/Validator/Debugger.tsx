import { K6TestOptions } from '@/utils/k6/schema'

import { BrowserDebugger } from './Browser/BrowserDebugger'
import { HttpDebugger } from './HTTP/HttpDebugger'
import { DebugSession } from './types'

function isBrowserTest(option: K6TestOptions): boolean {
  return Object.values(option.scenarios ?? {}).some(
    (scenario) => scenario.options?.browser !== undefined
  )
}

interface DebuggerProps {
  script: string
  options: K6TestOptions
  session: DebugSession
  onDebugScript: () => void
}

export function Debugger({
  script,
  options,
  session,
  onDebugScript,
}: DebuggerProps) {
  if (isBrowserTest(options)) {
    return (
      <BrowserDebugger
        script={script}
        session={session}
        onDebugScript={onDebugScript}
      />
    )
  }

  return (
    <HttpDebugger
      script={script}
      session={session}
      onDebugScript={onDebugScript}
    />
  )
}
