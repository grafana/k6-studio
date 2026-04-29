import { DropdownMenu } from '@radix-ui/themes'

import { ContextMenuEvent } from '@/components/SessionPlayer/SessionPlayer.hooks'
import { getElementRoles } from '@/recorder/browser/utils/aria'

import {
  buildLocatorOptions,
  getInteractiveTarget,
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
  const target = getInteractiveTarget(position.target)
  const locator = buildLocatorOptions(target)
  const roles = [...getElementRoles(target)].map((r) => r.role)

  const isGeneric =
    !isTextInput(target, roles) &&
    !isCheckbox(target, roles) &&
    !isRadio(target, roles) &&
    !isSelect(target, roles)

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
        {isTextInput(target, roles) && (
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
        {isCheckbox(target, roles) && (
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
        {isRadio(target, roles) && (
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
        {isSelect(target, roles) && (
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
