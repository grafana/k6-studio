import { useState } from 'react'
import { Box, Button, Checkbox, Flex, Text } from '@radix-ui/themes'

export function DebugControls() {
  const [showDebugControls, setShowDebugControls] = useState(false)

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
  return (
    <>
      <Box>
        <Text as="label" size="2">
          <Flex gap="2" mb="3">
            Show Debug Controls
            <Checkbox
              checked={showDebugControls}
              onCheckedChange={() => setShowDebugControls((val) => !val)}
            />
          </Flex>
        </Text>
      </Box>
      {showDebugControls && (
        <Flex direction="column" gap="2" pb="4" align="end">
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
      )}
    </>
  )
}
