import { css } from '@emotion/react'
import { CircleIcon, EllipsisVerticalIcon } from 'lucide-react'

import { DropdownMenu } from '@/components/primitives/DropdownMenu'
import { Toolbar } from '@/components/primitives/Toolbar'

import { InBrowserSettings } from '../../../messaging/types'
import { useInBrowserSettings } from '../SettingsProvider'

import { ToolBoxTooltip } from './ToolBoxTooltip'

interface ToolBoxMenuProps {}

export function ToolBoxMenu({}: ToolBoxMenuProps) {
  const [settings, setSettings] = useInBrowserSettings()

  const clickRecordingMode = settings.clickRecordingMode ?? 'interactive'

  const handleClickModeChange = (value: string) => {
    if (value === 'interactive' || value === 'any') {
      setSettings({ clickRecordingMode: value })
    }
  }

  return (
    <DropdownMenu.Root>
      <ToolBoxTooltip content="Recording options">
        <DropdownMenu.Trigger asChild>
          <Toolbar.Button
            css={css`
              &:hover {
                background-color: var(--studio-toggle-bg-on);
              }
            `}
          >
            <EllipsisVerticalIcon />
          </Toolbar.Button>
        </DropdownMenu.Trigger>
      </ToolBoxTooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
          css={css`
            animation-duration: 0.15s;
            animation-timing-function: ease-out;
          `}
        >
          <DropdownMenu.Label>Record clicks on...</DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={clickRecordingMode}
            onValueChange={handleClickModeChange}
          >
            <DropdownMenu.RadioItem value="interactive">
              <DropdownMenu.ItemIndicator>
                <CircleIcon
                  css={css`
                    width: 8px;
                    height: 8px;
                    fill: currentColor;
                  `}
                />
              </DropdownMenu.ItemIndicator>
              Interactive elements
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="any">
              <DropdownMenu.ItemIndicator>
                <CircleIcon
                  css={css`
                    width: 8px;
                    height: 8px;
                    fill: currentColor;
                  `}
                />
              </DropdownMenu.ItemIndicator>
              Any elements
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
