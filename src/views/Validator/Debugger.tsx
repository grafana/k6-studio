import { Button } from '@radix-ui/themes'
import { BugPlayIcon } from 'lucide-react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { K6TestOptions } from '@/utils/k6/schema'

import { BrowserDebugger } from './Browser/BrowserDebugger'
import { HttpDebugger } from './HTTP/HttpDebugger'
import { DebugSession } from './types'

function isBrowserTest(option: K6TestOptions): boolean {
  return Object.values(option.scenarios ?? {}).some(
    (scenario) => scenario.options?.browser !== undefined
  )
}

interface DebuggerEmptyStateProps {
  onDebugScript: () => void
}

function DebuggerEmptyState({ onDebugScript }: DebuggerEmptyStateProps) {
  return (
    <EmptyMessage
      message="Inspect what your script is doing while it runs."
      action={
        <Button onClick={onDebugScript}>
          <BugPlayIcon /> Debug script
        </Button>
      }
      justify="center"
      maxHeight="800px"
      illustration={undefined}
    />
  )
}

interface DebuggerProps {
  options: K6TestOptions
  session: DebugSession | null
  onDebugScript: () => void
}

export function Debugger({ options, session, onDebugScript }: DebuggerProps) {
  if (session === null) {
    return <DebuggerEmptyState onDebugScript={onDebugScript} />
  }

  if (isBrowserTest(options)) {
    return <BrowserDebugger session={session} />
  }

  return <HttpDebugger session={session} />
}
