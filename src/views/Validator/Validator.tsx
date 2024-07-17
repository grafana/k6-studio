import { PageHeading } from '@/components/Layout/PageHeading'
import { LogView } from '@/components/LogView'
import { WebLogView } from '@/components/WebLogView'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRecorderStore } from '@/hooks/useRecorderStore'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { K6Log } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { Button, Flex, Heading, ScrollArea, Spinner } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

export function Validator() {
  const [scriptPath, setScriptPath] = useState<string>()
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<K6Log[]>([])
  useListenProxyData()
  const proxyData = useRecorderStore((store) => store.proxyData)
  const resetProxyData = useRecorderStore((store) => store.resetProxyData)
  useSetWindowTitle('Validator')

  const groupedProxyData = groupProxyData(proxyData)

  async function handleSelectScript() {
    const path = await window.studio.script.showScriptSelectDialog()
    setScriptPath(path)
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

  function handleStopScript() {
    window.studio.script.stopScript()
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
        <Button color="amber" disabled={!isRunning} onClick={handleStopScript}>
          Stop Script
        </Button>
      </PageHeading>
      <Flex gap="3" flexGrow="1" minHeight="0">
        <Flex width="50%" maxHeight="100%" direction="column">
          <Heading size="4" mb="2">
            Requests
          </Heading>
          <ScrollArea scrollbars="vertical">
            <WebLogView requests={groupedProxyData} />
          </ScrollArea>
        </Flex>

        <Flex width="50%" maxHeight="100%" direction="column">
          <Heading size="4" mb="2">
            Logs
          </Heading>
          <ScrollArea scrollbars="vertical">
            <LogView logs={logs} />
          </ScrollArea>
        </Flex>
      </Flex>
    </>
  )
}
