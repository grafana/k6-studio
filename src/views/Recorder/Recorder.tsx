import { useEffect, useState } from 'react'
import { Button, Flex } from '@radix-ui/themes'
import { WebLogView } from '@/components/WebLogView'
import reqs from 'requests.json'
import { ProxyData } from '@/lib/types'

export function Recorder() {
  const [requests, setRequests] = useState(reqs as ProxyData[])

  function handleLaunchProxy() {
    window.studio.proxy.launchProxy()
  }

  function handleStopProxy() {
    window.studio.proxy.stopProxy()
  }

  function handleLaunchBrowser() {
    window.studio.browser.launchBrowser()
  }

  function handleStopBrowser() {
    window.studio.browser.stopBrowser()
  }

  useEffect(() => {
    window.studio.proxy.onProxyData((data) => {
      setRequests((prev) => [...prev, data])
    })
  }, [])

  console.log('requests', requests)
  return (
    <>
      <Flex direction="column" gap="2">
        <Flex gap="1">
          <Button onClick={handleLaunchProxy}>Launch Proxy</Button>
          <Button color="red" onClick={handleStopProxy}>
            Stop Proxy
          </Button>
        </Flex>
        <Flex gap="1">
          <Button onClick={handleLaunchBrowser}>Launch Browser</Button>
          <Button color="red" onClick={handleStopBrowser}>
            Stop Browser
          </Button>
        </Flex>
      </Flex>
      <WebLogView requests={requests} />
    </>
  )
}
