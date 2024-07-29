import { PageHeading } from '@/components/Layout/PageHeading'
import { LogView } from '@/components/LogView'
import { WebLogView } from '@/components/WebLogView'
import { useListenProxyData } from '@/hooks/useListenProxyData'
import { useRecorderStore } from '@/store/recorder'
import { useSetWindowTitle } from '@/hooks/useSetWindowTitle'
import { K6Log } from '@/types'
import { groupProxyData } from '@/utils/groups'
import { Button, Flex, Heading, ScrollArea, Spinner } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { Allotment } from 'allotment'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { useAutoScroll } from '@/hooks/useAutoScroll'

export function Validator() {
  const [scriptPath, setScriptPath] = useState<string>()
  const [script, setScript] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<K6Log[]>([])
  const proxyData = useRecorderStore((store) => store.proxyData)
  const resetProxyData = useRecorderStore((store) => store.resetProxyData)

  const requestsRef = useAutoScroll(proxyData)
  const logsRef = useAutoScroll(logs)

  useListenProxyData()
  useSetWindowTitle('Validator')

  const groupedProxyData = groupProxyData(proxyData)

  async function handleSelectScript() {
    const { path = '', content = '' } =
      (await window.studio.script.showScriptSelectDialog()) || {}
    setScriptPath(path)
    setScript(content)
  }

  function handleRunScript() {
    if (!scriptPath || !script) {
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
      <Allotment vertical defaultSizes={[3, 2]}>
        <Allotment.Pane minSize={300}>
          <Allotment defaultSizes={[1, 1]}>
            <Allotment.Pane>
              <Flex maxHeight="100%" direction="column" p="2">
                <Heading size="2" mb="2">
                  Requests
                </Heading>
                <ScrollArea scrollbars="vertical">
                  <div ref={requestsRef}>
                    <WebLogView requests={groupedProxyData} />
                  </div>
                </ScrollArea>
              </Flex>
            </Allotment.Pane>
            <Allotment.Pane>
              <Flex maxHeight="100%" height="100%" direction="column" p="2">
                <Heading size="2" mb="2">
                  Script
                </Heading>
                <ReadOnlyEditor language="javascript" value={script} />
              </Flex>
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={300}>
          <Flex maxHeight="100%" direction="column" p="2">
            <Heading size="2" mb="2">
              Logs
            </Heading>
            <ScrollArea scrollbars="vertical">
              <div ref={logsRef}>
                <LogView logs={logs} />
              </div>
            </ScrollArea>
          </Flex>
        </Allotment.Pane>
      </Allotment>
    </>
  )
}
