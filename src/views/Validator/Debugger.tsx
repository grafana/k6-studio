import { StudioFile } from '@/types'
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
  file: StudioFile
  script: string
  options: K6TestOptions
  session: DebugSession
  onDebugScript: () => void
  onScriptChange: (value: string) => void
}

export function Debugger({
  file,
  script,
  options,
  session,
  onDebugScript,
  onScriptChange,
}: DebuggerProps) {
  if (isBrowserTest(options)) {
    return (
      <BrowserDebugger
        file={file}
        script={script}
        session={session}
        onDebugScript={onDebugScript}
        onScriptChange={onScriptChange}
      />
    )
  }

  return (
    <HttpDebugger
      script={script}
      session={session}
      onDebugScript={onDebugScript}
      onScriptChange={onScriptChange}
    />
  )
}
