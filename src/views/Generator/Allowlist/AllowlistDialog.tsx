import { Button, Dialog, Flex } from '@radix-ui/themes'
import { GlobeIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { PopoverDialog } from '@/components/PopoverDialogs'
import { useGeneratorStore } from '@/store/generator'
import {
  extractUniqueHosts,
  groupHostsByParty,
} from '@/store/generator/slices/recording.utils'
import { ProxyData } from '@/types'

import { type Allowlist, AllowlistEditor } from './AllowlistEditor'

interface AllowlistDialogProps {
  requests: ProxyData[]
  allowlist: Allowlist
  open: boolean
  onChange: (value: Allowlist) => void
  onOpenChange: (open: boolean) => void
}

export function AllowlistDialog({
  requests,
  allowlist,
  open,
  onChange,
  onOpenChange,
}: AllowlistDialogProps) {
  const [openAsPopover, setOpenAsPopover] = useState(false)

  const { firstParty, thirdParty } = useMemo(() => {
    const uniqueHosts = extractUniqueHosts(requests)
    return groupHostsByParty(uniqueHosts)
  }, [requests])

  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    // Using allowlist.length would require adding it as a dependency of useEffect.
    // This causes an unintended behavior of automatically selecting the first item when the user unselects all checkboxes. (making it impossible to make allowlist empty).
    const { allowlist, includeStaticAssets } = useGeneratorStore.getState()

    if (firstParty[0] !== undefined && allowlist.length === 0) {
      onChangeRef.current({
        includeStaticAssets: includeStaticAssets,
        hosts: [firstParty[0]],
      })
    }
  }, [firstParty])

  function handleOpenChange(open: boolean) {
    if (!open) {
      setOpenAsPopover(false)
    }

    onOpenChange(open)
  }

  // Show dialog as popover when triggered from the button
  const Wrapper = openAsPopover ? PopoverWrapper : DialogWrapper

  const trigger = (
    <Button
      size="1"
      variant="ghost"
      color="gray"
      onClick={() => setOpenAsPopover(true)}
    >
      <GlobeIcon />
      Allowed hosts [{allowlist.hosts.length}/
      {firstParty.length + thirdParty.length}]
    </Button>
  )

  return (
    <Wrapper trigger={trigger} open={open} onOpenChange={handleOpenChange}>
      <AllowlistEditor
        firstPartyHosts={firstParty}
        thirdPartyHosts={thirdParty}
        allowlist={allowlist}
        requests={requests}
        onChange={onChange}
      />
    </Wrapper>
  )
}

interface WrapperProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PopoverWrapper({
  trigger,
  children,
  open,
  onOpenChange,
}: WrapperProps) {
  return (
    <PopoverDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      modal // needed to automatically open when switching recordings
    >
      {children}
    </PopoverDialog>
  )
}

function DialogWrapper({
  trigger,
  children,
  open,
  onOpenChange,
}: WrapperProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Content width="450px" size="2">
        {children}
        <Dialog.Close>
          <Flex justify="end">
            <Button>Continue</Button>
          </Flex>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  )
}
