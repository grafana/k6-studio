import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
  Button,
  CheckboxGroup,
  Dialog,
  Flex,
  IconButton,
  TextField,
} from '@radix-ui/themes'
import { isEqual } from 'lodash-es'
import { useState } from 'react'

export function AllowListDialog({
  open,
  onOpenChange,
  hosts,
  allowList,
  onAllowListChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hosts: string[]
  allowList: string[]
  onAllowListChange: (allowList: string[]) => void
}) {
  const [filter, setFilter] = useState('')
  const [selectedHosts, setSelectedHosts] = useState(allowList)

  const filteredHosts = hosts.filter((host) => host.includes(filter))

  function handleSelectAll() {
    setSelectedHosts(filteredHosts)
  }

  function handleSelectNone() {
    setSelectedHosts([])
  }

  function handleSave() {
    onAllowListChange(selectedHosts)
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