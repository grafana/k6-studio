import { Button, Flex } from '@radix-ui/themes'
import { useStudioUIStore } from '@/store/ui'

export function DebugControls() {
  const showDebugControls = useStudioUIStore(
    (state) => !!state.devToggles.showDebugControls
  )

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

  if (!showDebugControls) {
    return null
  }

  return (
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
  )
}
