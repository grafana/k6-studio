import { css } from '@emotion/react'
import { Box, Button, Dialog, Flex, Spinner } from '@radix-ui/themes'
import { useCallback, useEffect, useState } from 'react'

import { EmptyMessage } from '@/components/EmptyMessage'
import { ProxyHealthBadge } from '@/components/ProxyHealthWarning'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useProxyHealthCheck } from '@/hooks/useProxyHealthCheck'
import { useRunChecks } from '@/hooks/useRunChecks'
import { useRunLogs } from '@/hooks/useRunLogs'
import { ValidatorResult } from '@/views/Generator/ValidatorResult'

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

  const { isProxyHealthy } = useProxyHealthCheck()

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

    await window.studio.script.runScriptFromGenerator(script)
  }, [resetState, script])

  useEffect(() => {
    if (!open) return

    // TODO: https://github.com/grafana/k6-studio/issues/277
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleRunScript()
  }, [open, handleRunScript])

  useEffect(() => {
    return window.studio.script.onScriptFinished(() => {
      setIsRunning(false)
    })
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptFailed(() => {
      setIsRunning(false)
    })
  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content maxWidth="95vw" height="85vh" size="2" asChild>
        <Flex direction="column">
          <Dialog.Title>
            <Flex justify="between">
              <Flex align="center">
                Validator
                {isRunning && <Spinner ml="2" />}
                {!isProxyHealthy && <ProxyHealthBadge />}
              </Flex>
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
          <Box
            flexGrow="1"
            mx="-4"
            mb="-4"
            css={css`
              border-top: 1px solid var(--gray-5);
            `}
          >
            <ValidatorResult
              script={script}
              proxyData={proxyData}
              logs={logs}
              checks={checks}
              noDataElement={
                <EmptyMessage message="Requests will appear here" />
              }
              isRunning={isRunning}
            />
          </Box>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
