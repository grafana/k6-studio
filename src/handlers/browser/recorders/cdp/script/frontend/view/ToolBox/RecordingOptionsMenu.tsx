import { css } from '@emotion/react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { CheckIcon, EllipsisVerticalIcon } from 'lucide-react'

import { Toolbar } from '@/components/primitives/Toolbar'

import { useInBrowserSettings } from '../SettingsProvider'

import { ToolBoxTooltip } from './ToolBoxTooltip'

export function RecordingOptionsMenu() {
  const [settings, setSettings] = useInBrowserSettings()

  const handleValueChange = (value: string) => {
    if (value === 'interactive' || value === 'any') {
      setSettings({ clickRecordingMode: value })
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div>
          <ToolBoxTooltip content="Recording options">
            <Toolbar.Button>
              <EllipsisVerticalIcon />
            </Toolbar.Button>
          </ToolBoxTooltip>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="center"
          sideOffset={8}
          css={css`
            background-color: var(--gray-1);
            border: 1px solid var(--gray-6);
            border-radius: var(--radius-2);
            padding: var(--space-1);
            box-shadow: var(--shadow-5);
            min-width: 220px;
            z-index: 99999;
          `}
        >
          <DropdownMenu.Label
            css={css`
              padding: var(--space-2) var(--space-3);
              font-size: var(--font-size-1);
              font-weight: 500;
              color: var(--gray-11);
            `}
          >
            Record clicks on...
          </DropdownMenu.Label>

          <DropdownMenu.RadioGroup
            value={settings.clickRecordingMode}
            onValueChange={handleValueChange}
          >
            <DropdownMenu.RadioItem
              value="interactive"
              css={css`
                display: flex;
                align-items: center;
                padding: var(--space-2) var(--space-3);
                font-size: var(--font-size-2);
                color: var(--gray-12);
                cursor: pointer;
                border-radius: var(--radius-1);
                outline: none;
                user-select: none;

                &:hover {
                  background-color: var(--gray-3);
                }

                &:focus {
                  background-color: var(--gray-4);
                }

                &[data-state='checked'] {
                  font-weight: 500;
                }
              `}
            >
              <DropdownMenu.ItemIndicator
                css={css`
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 16px;
                  margin-right: var(--space-2);
                `}
              >
                <CheckIcon
                  css={css`
                    width: 14px;
                    height: 14px;
                  `}
                />
              </DropdownMenu.ItemIndicator>
              <span
                css={css`
                  margin-left: ${settings.clickRecordingMode !== 'interactive'
                    ? 'calc(16px + var(--space-2))'
                    : '0'};
                `}
              >
                Interactive elements
              </span>
            </DropdownMenu.RadioItem>

            <DropdownMenu.RadioItem
              value="any"
              css={css`
                display: flex;
                align-items: center;
                padding: var(--space-2) var(--space-3);
                font-size: var(--font-size-2);
                color: var(--gray-12);
                cursor: pointer;
                border-radius: var(--radius-1);
                outline: none;
                user-select: none;

                &:hover {
                  background-color: var(--gray-3);
                }

                &:focus {
                  background-color: var(--gray-4);
                }

                &[data-state='checked'] {
                  font-weight: 500;
                }
              `}
            >
              <DropdownMenu.ItemIndicator
                css={css`
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 16px;
                  margin-right: var(--space-2);
                `}
              >
                <CheckIcon
                  css={css`
                    width: 14px;
                    height: 14px;
                  `}
                />
              </DropdownMenu.ItemIndicator>
              <span
                css={css`
                  margin-left: ${settings.clickRecordingMode !== 'any'
                    ? 'calc(16px + var(--space-2))'
                    : '0'};
                `}
              >
                Any elements
              </span>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
