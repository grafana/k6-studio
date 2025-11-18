import { Box } from '@radix-ui/themes'
import { Allotment } from 'allotment'
import { ReactNode } from 'react'

import { ExecutionDetails } from '@/components/Validator/ExecutionDetails'
import { Check, LogEntry } from '@/schemas/k6'

interface ValidatorLayoutProps {
  isRunning: boolean
  script: string
  logs: LogEntry[]
  checks: Check[]
  details: ReactNode
  children: ReactNode
}

export function ValidatorLayout({
  isRunning,
  script,
  logs,
  checks,
  details,
  children,
}: ValidatorLayoutProps) {
  return (
    <Allotment defaultSizes={[3, 2]}>
      <Allotment.Pane minSize={250}>
        <Allotment vertical defaultSizes={[1, 1]}>
          <Allotment.Pane>{children}</Allotment.Pane>
          <Allotment.Pane minSize={250}>
            <Box height="100%">
              <ExecutionDetails
                isRunning={isRunning}
                script={script}
                logs={logs}
                checks={checks}
              />
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Allotment.Pane>
      {details && <Allotment.Pane minSize={300}>{details}</Allotment.Pane>}
    </Allotment>
  )
}
