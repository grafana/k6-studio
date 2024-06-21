import { PageHeading } from '@/components/Layout/PageHeading'
import { LogView } from '@/components/LogView'
import { WebLogView } from '@/components/WebLogView'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { K6Log } from '@/types'
import { Box, Button, Flex, Heading, Spinner } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

export function Validator() {
  const [scriptPath, setScriptPath] = useState<string>()
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<K6Log[]>([])
  const { proxyData, resetProxyData } = useListenProxyData()

  function handleSelectScript() {
    window.studio.script.showScriptSelectDialog().then((path) => {
      setScriptPath(path)
    })
  }

  function handleRunScript() {
    if (!scriptPath) {
      return
    }

    resetProxyData()
    setLogs([])

    window.studio.script.runScript(scriptPath)
    setIsRunning(true)
  }

  useEffect(() => {
    return window.studio.script.onScriptStopped(() => {
      setIsRunning(false)
    })
  }, [])

  useEffect(() => {
    return window.studio.script.onScriptLog((log) => {
      setLogs((prev) => [...prev, log])
    })
  }, [])

  return (
    <>
      <PageHeading text="Validator">
        <Flex gap="2" justify="end" align="center">
          <Button onClick={handleSelectScript}>Select Script</Button>
          <Button
            color="green"
            disabled={!scriptPath || isRunning}
            onClick={handleRunScript}
          >
            {isRunning ? (
              <>
                <Spinner />
                Running...
              </>
            ) : (
              'Run Script'
            )}
          </Button>
          <Button color="amber" disabled={!isRunning}>
            Stop Script
          </Button>
        </Flex>
      </PageHeading>
      <Flex gap="3">
        <Box width="50%">
          <Heading size="4" mb="2">
            Requests
          </Heading>
          <WebLogView requests={proxyData} />
        </Box>
        <Box width="50%">
          <Heading size="4" mb="2">
            Logs
          </Heading>
          <LogView logs={logs} />
        </Box>
      </Flex>
    </>
  )
}
