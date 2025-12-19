import { Button } from '@radix-ui/themes'
import { ReactNode } from 'react'

import { EmptyMessage } from '@/components/EmptyMessage'

interface DebuggerEmptyStateProps {
  children: ReactNode
  onDebugScript: () => void
}

export function DebuggerEmptyState({
  children,
  onDebugScript,
}: DebuggerEmptyStateProps) {
  return (
    <EmptyMessage
      message={children}
      action={<Button onClick={onDebugScript}>Debug script</Button>}
      justify="center"
      maxHeight="800px"
      illustration={undefined}
    />
  )
}
