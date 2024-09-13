import { Box, Button, Dialog, Flex } from '@radix-ui/themes'
import { useCallback, useEffect, useState } from 'react'

import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRunLogs } from '@/hooks/useRunLogs'
import { ValidatorContent } from '@/views/Validator/ValidatorContent'
import { useRunChecks } from '@/hooks/useRunChecks'

interface ValidatorDialogProps {
  script: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ValidatorDialog({
  script,
  open,
  onOpenChange,
}: ValidatorDialogProps) {
  const [isRunning, setIsRunning] = useState(false)
  const { proxyData, resetProxyData } = useListenProxyData()
  const { logs, resetLogs } = useRunLogs()
  const { checks, resetChecks } = useRunChecks()

  const resetState = useCallback(() => {
    resetLogs()
    resetProxyData()
    resetChecks()
  }, [resetChecks, resetLogs, resetProxyData])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        window.studio.script.stopScript()
        setIsRunning(false)
        resetState()
      }

      onOpenChange(open)
    },
    [onOpenChange, resetState]
  )

  const handleRunScript = useCallback(async () => {
    resetState()
    setIsRunning(true)

    await window.studio.script.saveScript(script, true)
    await window.studio.script.runScript(
      'k6-studio-generator-script.js',
      false,
      true
    )
  }, [resetState, script])

  useEffect(() => {
    if (!open) return

    handleRunScript()
  }, [open, handleRunScript])

  useEffect(() => {
    return window.studio.script.onScriptFinished(() => {
      setIsRunning(false)
    })
  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content maxWidth="95vw" height="85vh" size="2" asChild>
        <Flex direction="column">
          <Dialog.Title>
            <Flex justify="between">
              Validator
              <Flex gap="3" justify="end" align="center">
                <Dialog.Close>
                  <Button variant="outline">Close</Button>
                </Dialog.Close>
                <Button
                  variant="outline"
                  loading={isRunning}
                  onClick={handleRunScript}
                >
                  Re-run script
                </Button>
              </Flex>
            </Flex>
          </Dialog.Title>
          <Box flexGrow="1" mx="-4" mb="-4">
            <ValidatorContent
              script={script}
              proxyData={proxyData}
              logs={logs}
              checks={checks}
              noRequestsMessage="Requests will appear here"
              isRunning={isRunning}
            />
          </Box>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
