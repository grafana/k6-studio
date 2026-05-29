import { DropdownMenu } from '@radix-ui/themes'

import { AnyBrowserAction } from '@/schemas/browserTest'
import { LocatorOptions } from '@/schemas/locator'
import { AriaDetails } from '@/schemas/recording'

import {
  createCheckAction,
  createClearAction,
  createClickAction,
  createFillAction,
  createSelectOptionAction,
  createToBeCheckedAction,
  createToHaveValueAction,
  createToBeVisibleAction,
  createToContainTextAction,
  createUncheckAction,
  createWaitForAction,
} from './actionFactories'
import {
  getTextInputValue,
  isCheckbox,
  isRadio,
  isSelect,
  isTextInput,
} from './ReplayContextMenu.utils'

interface ReplayContextMenuProps {
  target: Element
  position: { x: number; y: number }
  aria: AriaDetails
  locator: LocatorOptions
  onClose: () => void
  onAddAction: (action: AnyBrowserAction) => void
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
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onClick={() =>
                onAddAction(
                  createToHaveValueAction({
                    locator,
                    expected: {
                      current: 'single',
                      values: {
                        single: getTextInputValue(target),
                      },
                    },
                  })
                )
              }
            >
              Expect to have value
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
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onClick={() => onAddAction(createToBeCheckedAction({ locator }))}
            >
              Expect to be checked
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
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => onAddAction(createToBeVisibleAction({ locator }))}
        >
          Expect to be visible
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() =>
            onAddAction(
              createToContainTextAction({
                locator,
                expected: target.textContent ?? '',
              })
            )
          }
        >
          Expect to contain text
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => onAddAction(createWaitForAction({ locator }))}
        >
          Wait for element
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
