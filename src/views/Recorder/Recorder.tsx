import { useEffect, useRef, useState } from 'react'
import { Button, Flex, Heading } from '@radix-ui/themes'
import { WebLogView } from '@/components/WebLogView'
import { GroupedProxyData, ProxyData } from '@/types'
import { reverse, uniqBy } from 'lodash-es'
import { GroupForm } from './GroupForm'

export function Recorder() {
  const [requests, setRequests] = useState<GroupedProxyData>({})

  const [group, setGroup] = useState<string>('Default')
  const groupRef = useRef(group)

  function handleLaunchProxy() {
    console.log('starting proxy')
    window.studio.proxy.launchProxy()
  }

  function handleStopProxy() {
    window.studio.proxy.stopProxy()
  }

  function handleLaunchBrowser() {
    console.log('starting browser')
    window.studio.browser.launchBrowser()
  }

  function handleStopBrowser() {
    window.studio.browser.stopBrowser()
  }

  useEffect(() => {
    // Create ref to avoid creating multiple listeners
    // for proxyData
    groupRef.current = group
  }, [group])

  useEffect(() => {
    window.studio.proxy.onProxyData((data) => {
      setRequests((prev) => {
        const current = prev[groupRef.current] || []
        const mergedRequests = mergeRequestsById([...current, data])

        return {
          ...prev,
          [groupRef.current]: mergedRequests,
        }
      })
    })
  }, [])

  return (
    <>
      <Flex direction="column" gap="2" pb="4">
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
      <GroupForm onChange={setGroup} value={group} />
      <Heading my="4">Requests</Heading>
      <WebLogView requests={requests} />
    </>
  )
}

// We get 2 requests with the same id, one when
// the request is sent and another when the response is received
function mergeRequestsById(requests: ProxyData[]) {
  // Reverse to keep the latest request
  return reverse(uniqBy(reverse(requests), 'id'))
}
