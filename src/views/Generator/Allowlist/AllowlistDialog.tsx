import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  CheckboxGroup,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  TextField,
} from '@radix-ui/themes'
import { isEqual } from 'lodash-es'
import { useState } from 'react'

export function AllowlistDialog({
  open,
  onOpenChange,
  hosts,
  allowlist,
  onAllowlistChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hosts: string[]
  allowlist: string[]
  onAllowlistChange: (allowlist: string[]) => void
}) {
  const [filter, setFilter] = useState('')
  const [selectedHosts, setSelectedHosts] = useState(allowlist)

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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="450px" size="2">
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

        <Box height="200px" asChild pr="3">
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
