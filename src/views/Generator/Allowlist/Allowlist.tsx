import { Button, Dialog, Flex } from '@radix-ui/themes'
import { GlobeIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { PopoverDialog } from '@/components/PopoverDialogs'
import { useGeneratorStore } from '@/store/generator'
import {
  extractUniqueHosts,
  groupHostsByParty,
} from '@/store/generator/slices/recording.utils'

import { AllowlistDialog } from './AllowlistDialog'

export function Allowlist() {
  const requests = useGeneratorStore((store) => store.requests)

  const allowlist = useGeneratorStore((store) => store.allowlist)
  const setAllowlist = useGeneratorStore((store) => store.setAllowlist)

  const [openAsPopover, setOpenAsPopover] = useState(false)

  const showAllowlistDialog = useGeneratorStore(
    (store) => store.showAllowlistDialog
  )
  const setShowAllowlistDialog = useGeneratorStore(
    (store) => store.setShowAllowlistDialog
  )

  const includeStaticAssets = useGeneratorStore(
    (store) => store.includeStaticAssets
  )
  const setIncludeStaticAssets = useGeneratorStore(
    (store) => store.setIncludeStaticAssets
  )

  const { firstParty, thirdParty } = useMemo(() => {
    const uniqueHosts = extractUniqueHosts(requests)
    return groupHostsByParty(uniqueHosts)
  }, [requests])

  useEffect(() => {
    // Using allowlist.length would require adding it as a dependency of useEffect.
    // This causes an unintended behavior of automatically selecting the first item when the user unselects all checkboxes. (making it impossible to make allowlist empty).
    const allowlistCount = useGeneratorStore.getState().allowlist.length
    if (firstParty[0] !== undefined && allowlistCount === 0) {
      setAllowlist([firstParty[0]])
    }
  }, [firstParty, setAllowlist])

  function handleOpenChange(open: boolean) {
    if (!open) {
      setOpenAsPopover(false)
    }

    setShowAllowlistDialog(open)
  }

  // Show dialog as popover when triggered from the button
  const Wrapper = openAsPopover ? PopoverWrapper : DialogWrapper

  const allHosts = [...firstParty, ...thirdParty]

  const trigger = (
    <Button
      size="1"
      variant="ghost"
      color="gray"
      onClick={() => setOpenAsPopover(true)}
    >
      <GlobeIcon />
      Allowed hosts [{allowlist.length}/{allHosts.length}]
    </Button>
  )

  return (
    <Wrapper
      trigger={trigger}
      open={showAllowlistDialog}
      onOpenChange={handleOpenChange}
    >
      <AllowlistDialog
        firstPartyHosts={firstParty}
        thirdPartyHosts={thirdParty}
        allowlist={allowlist}
        requests={requests}
        includeStaticAssets={includeStaticAssets}
        setAllowlist={setAllowlist}
        setIncludeStaticAssets={setIncludeStaticAssets}
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
