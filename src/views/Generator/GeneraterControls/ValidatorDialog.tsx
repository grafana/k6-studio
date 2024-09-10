import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRunLogs } from '@/hooks/useRunLogs'
import { ValidatorContent } from '@/views/Validator/ValidatorContent'
import { Box, Button, Dialog, Flex, Spinner, Text } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { exportScript } from '../Generator.utils'
import { useRunChecks } from '@/hooks/useRunChecks'
import { css } from '@emotion/react'

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

  function handleStopScript() {
    if (!isRunning) return
    window.studio.script.stopScript()
    setIsRunning(false)
  }

  useEffect(() => {
    resetLogs()
    resetProxyData()
    resetChecks()
    setIsRunning(open)

    if (open) {
      //window.studio.script.runScript(scriptPath, isExternal)
      console.log('Running script')
    }
  }, [open, resetChecks, resetLogs, resetProxyData])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="95vw" height="85vh" size="2" asChild>
        <Flex direction="column">
          <Dialog.Title>
            <Flex justify="between">
              Validator
              <Flex gap="3" justify="end" align="center">
                {isRunning && (
                  <>
                    <Spinner />{' '}
                    <Text
                      css={css`
                        font-size: 14px;
                      `}
                    >
                      Running
                    </Text>
                  </>
                )}
                <Dialog.Close>
                  <Button
                    variant="soft"
                    color="gray"
                    onClick={handleStopScript}
                  >
                    Close
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button onClick={exportScript}>Save script</Button>
                </Dialog.Close>
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
