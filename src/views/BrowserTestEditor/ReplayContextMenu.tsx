import { DropdownMenu } from '@radix-ui/themes'

import { AriaDetails } from '@/schemas/recording'

import {
  isCheckbox,
  isRadio,
  isSelect,
  isTextInput,
} from './ReplayContextMenu.utils'
import {
  createCheckAction,
  createClearAction,
  createClickAction,
  createFillAction,
  createSelectOptionAction,
  createUncheckAction,
  createWaitForAction,
} from './actionFactories'
import { BrowserActionInstance, LocatorOptions } from './types'

interface ReplayContextMenuProps {
  target: Element
  position: { x: number; y: number }
  aria: AriaDetails
  locator: LocatorOptions
  onClose: () => void
  onAddAction: (action: BrowserActionInstance) => void
}

export function ReplayContextMenu({
  target,
  position,
  aria,
  locator,
  onClose,
  onAddAction,
}: ReplayContextMenuProps) {
  const isGeneric =
    !isTextInput(target, aria.roles) &&
    !isCheckbox(target, aria.roles) &&
    !isRadio(target, aria.roles) &&
    !isSelect(target, aria.roles)

  return (
    <DropdownMenu.Root open onOpenChange={(open) => !open && onClose()}>
      <DropdownMenu.Trigger>
        <div
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="1" align="center">
        {isTextInput(target, aria.roles) && (
          <>
            <DropdownMenu.Item
              onClick={() => onAddAction(createFillAction({ locator }))}
            >
              Fill input
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => onAddAction(createClearAction({ locator }))}
            >
              Clear input
            </DropdownMenu.Item>
          </>
        )}
        {isCheckbox(target, aria.roles) && (
          <>
            <DropdownMenu.Item
              onClick={() => onAddAction(createCheckAction({ locator }))}
            >
              Check
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => onAddAction(createUncheckAction({ locator }))}
            >
              Uncheck
            </DropdownMenu.Item>
          </>
        )}
        {isRadio(target, aria.roles) && (
          <DropdownMenu.Item
            onClick={() => onAddAction(createCheckAction({ locator }))}
          >
            Check
          </DropdownMenu.Item>
        )}
        {isSelect(target, aria.roles) && (
          <DropdownMenu.Item
            onClick={() => onAddAction(createSelectOptionAction({ locator }))}
          >
            Select option
          </DropdownMenu.Item>
        )}
        {isGeneric && (
          <DropdownMenu.Item
            onClick={() => onAddAction(createClickAction({ locator }))}
          >
            Click
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Item
          onClick={() => onAddAction(createWaitForAction({ locator }))}
        >
          Wait for element
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
