import { Label } from '@/components/Label'
import { selectStaticAssetCount, useGeneratorStore } from '@/store/generator'
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  TextField,
  Text,
  Strong,
} from '@radix-ui/themes'
import { isEqual } from 'lodash-es'
import { useState } from 'react'

export function AllowlistDialog({
  open,
  onOpenChange,
  hosts,
  allowlist,
  onAllowlistChange,
  includeStaticAssets,
  setIncludeStaticAssets,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hosts: string[]
  allowlist: string[]
  onAllowlistChange: (allowlist: string[]) => void
  includeStaticAssets: boolean
  setIncludeStaticAssets: (includeStaticAssets: boolean) => void
}) {
  const [filter, setFilter] = useState('')
  const [selectedHosts, setSelectedHosts] = useState(allowlist)
  // TODO shoud it be moved to parent component to keep this component pure?
  const staticAssetCount = useGeneratorStore(selectStaticAssetCount)

  const filteredHosts = hosts.filter((host) => host.includes(filter))

  function handleSelectAll() {
    setSelectedHosts(filteredHosts)
  }

  function handleSelectNone() {
    setSelectedHosts([])
  }

  function handleSave() {
    onAllowlistChange(selectedHosts)
  }

  // TODO: change include static assets only when save is clicked
  // function handleIncludeStaticAssetsChange() {}

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="450px" size="2">
        {/* TODO: title will need to be changed if we allow to toggle static assets, check how it looks in figma */}
        <Dialog.Title>Allowed hosts</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Select hosts that you want to include in the test generator
        </Dialog.Description>

        <Flex mb="3" justify="between" gap="1">
          <Flex flexGrow="1" asChild>
            <TextField.Root
              placeholder="Filter"
              size="1"
              onChange={(e) => setFilter(e.target.value)}
              value={filter}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
              {filter !== '' && (
                <TextField.Slot>
                  <IconButton
                    size="1"
                    variant="ghost"
                    onClick={() => setFilter('')}
                  >
                    <Cross2Icon height="12" width="12" />
                  </IconButton>
                </TextField.Slot>
              )}
            </TextField.Root>
          </Flex>
          <Flex gap="1">
            <Button
              size="1"
              onClick={handleSelectAll}
              disabled={isEqual(filteredHosts, selectedHosts)}
            >
              Select all
            </Button>
            <Button
              size="1"
              onClick={handleSelectNone}
              color="amber"
              disabled={selectedHosts.length === 0}
            >
              Select none
            </Button>
          </Flex>
        </Flex>

        <Box maxHeight="200px" asChild pr="3" mb="3">
          <ScrollArea>
            <CheckboxGroup.Root
              value={selectedHosts}
              onValueChange={(e) => setSelectedHosts(e)}
            >
              {filteredHosts.map((host) => (
                <CheckboxGroup.Item value={host} key={host}>
                  {host}
                </CheckboxGroup.Item>
              ))}
            </CheckboxGroup.Root>
          </ScrollArea>
        </Box>
        <Label>
          <Checkbox
            onCheckedChange={setIncludeStaticAssets}
            checked={includeStaticAssets}
          />
          Include static assets
        </Label>
        <Text size="1" color="gray">
          Select to include <Strong>{staticAssetCount}</Strong> static assets
          requests (fonts, images, css, js etc).
        </Text>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={handleSave}>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
