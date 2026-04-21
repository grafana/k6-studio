import { ReactNode } from 'react'

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
  /** When set, replaces the read-only script editor (e.g. editable Monaco). */
  scriptSlot?: ReactNode
}

export function Debugger({
  script,
  options,
  session,
  onDebugScript,
  scriptSlot,
}: DebuggerProps) {
  if (isBrowserTest(options)) {
    return (
      <BrowserDebugger
        script={script}
        session={session}
        onDebugScript={onDebugScript}
        scriptSlot={scriptSlot}
      />
    )
  }

  return (
    <HttpDebugger
      script={script}
      session={session}
      onDebugScript={onDebugScript}
      scriptSlot={scriptSlot}
    />
  )
}
