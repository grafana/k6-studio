import { DropdownMenu } from '@radix-ui/themes'
import { useMemo } from 'react'

import { ContextMenuEvent } from '@/components/SessionPlayer/SessionPlayer.hooks'
import { getAriaDetails } from '@/utils/dom/aria'
import { findInteractiveElement } from '@/utils/dom/dom'
import { generateSelectors } from '@/utils/dom/selectors'

import {
  buildLocatorOptions,
  isCheckbox,
  isRadio,
  isSelect,
  isTextInput,
} from './contextMenuActions'
import { BrowserActionInstance } from './types'

interface ReplayContextMenuProps {
  position: ContextMenuEvent
  onClose: () => void
  onAddAction: (action: BrowserActionInstance) => void
}

export function ReplayContextMenu({
  position,
  onClose,
  onAddAction,
}: ReplayContextMenuProps) {
  const target = findInteractiveElement(position.target) ?? position.target

  const aria = useMemo(() => getAriaDetails(target), [target])

  const locator = useMemo(() => {
    const selectors = generateSelectors(target, aria)

    return buildLocatorOptions(selectors)
  }, [aria, target])

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
      <DropdownMenu.Content size="1">
        {isTextInput(target, aria.roles) && (
          <>
            <DropdownMenu.Item
              onClick={() =>
                onAddAction({
                  id: crypto.randomUUID(),
                  method: 'locator.fill',
                  value: '',
                  locator,
                })
              }
            >
              Fill input
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() =>
                onAddAction({
                  id: crypto.randomUUID(),
                  method: 'locator.clear',
                  locator,
                })
              }
            >
              Clear input
            </DropdownMenu.Item>
          </>
        )}
        {isCheckbox(target, aria.roles) && (
          <>
            <DropdownMenu.Item
              onClick={() =>
                onAddAction({
                  id: crypto.randomUUID(),
                  method: 'locator.check',
                  locator,
                })
              }
            >
              Check
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() =>
                onAddAction({
                  id: crypto.randomUUID(),
                  method: 'locator.uncheck',
                  locator,
                })
              }
            >
              Uncheck
            </DropdownMenu.Item>
          </>
        )}
        {isRadio(target, aria.roles) && (
          <DropdownMenu.Item
            onClick={() =>
              onAddAction({
                id: crypto.randomUUID(),
                method: 'locator.check',
                locator,
              })
            }
          >
            Check
          </DropdownMenu.Item>
        )}
        {isSelect(target, aria.roles) && (
          <DropdownMenu.Item
            onClick={() =>
              onAddAction({
                id: crypto.randomUUID(),
                method: 'locator.selectOption',
                values: [{ value: '' }],
                locator,
              })
            }
          >
            Select option
          </DropdownMenu.Item>
        )}
        {isGeneric && (
          <DropdownMenu.Item
            onClick={() =>
              onAddAction({
                id: crypto.randomUUID(),
                method: 'locator.click',
                locator,
              })
            }
          >
            Click
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Item
          onClick={() =>
            onAddAction({
              id: crypto.randomUUID(),
              method: 'locator.waitFor',
              locator,
            })
          }
        >
          Wait for element
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
