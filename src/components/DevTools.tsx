import { useStudioUIStore } from '@/store/ui'
import { Dialog, Flex, Switch, Text } from '@radix-ui/themes'
import { useState } from 'react'
import useKonami from 'use-konami'

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false)
  const showDebugControls = useStudioUIStore(
    (state) => !!state.devToggles.showDebugControls
  )
  const toggleDevToggle = useStudioUIStore((state) => state.toggleDevToggle)

  useKonami({
    onUnlock() {
      setIsOpen(true)
    },
  })

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Title>Dev Tools</Dialog.Title>
        <Text as="label" size="2">
          <Flex gap="2">
            <Switch
              size="1"
              checked={showDebugControls}
              onCheckedChange={() => {
                toggleDevToggle('showDebugControls')
              }}
            />{' '}
            Show debug controls in Recorder
          </Flex>
        </Text>
      </Dialog.Content>
    </Dialog.Root>
  )
}
