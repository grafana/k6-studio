import { Button, Dialog, Flex, Switch, Text } from '@radix-ui/themes'
import { useState } from 'react'
import useKonami from 'use-konami'

import { useFeaturesStore } from '@/store/features'
import { Feature } from '@/types/features'

export function DevModeDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useKonami({
    onUnlock: () => {
      setIsOpen(true)
    },
  })

  const features = useFeaturesStore((store) => store.features)
  const toggleFeature = useFeaturesStore((store) => store.toggleFeature)

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content>
        <Dialog.Title>Dev Tools</Dialog.Title>
        <Dialog.Description>Control feature toggles</Dialog.Description>
        <Flex direction="column" gap="2" my="4">
          {Object.entries(features).map(([feature, enabled]) => (
            <Text as="label" size="2" key={feature}>
              <Flex gap="2">
                <Switch
                  checked={enabled}
                  onCheckedChange={() => {
                    toggleFeature(feature as Feature)
                  }}
                />
                {feature}
              </Flex>
            </Text>
          ))}
        </Flex>
        <Dialog.Close>
          <Button>Close</Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  )
}

function ProdModeDialog() {
  return null
}

export const DevToolsDialog =
  // @ts-expect-error we have commonjs set as module option
  import.meta.env.MODE === 'development' ? DevModeDialog : ProdModeDialog
