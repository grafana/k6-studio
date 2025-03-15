import { css } from '@emotion/react'
import { CursorArrowIcon } from '@radix-ui/react-icons'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { ReactNode } from 'react'
import { Tool } from './types'

interface ToolBoxButtonProps {
  value: string
  children: ReactNode
}

function ToolBoxButton({ value, children }: ToolBoxButtonProps) {
  return (
    <ToggleGroup.Item
      value={value}
      css={css`
        background-color: transparent;
        border: none;
        padding: 8px;

        border-left: 1px solid rgba(0, 0, 0, 0.1);

        &:first-child {
          border-left: none;
        }

        &[data-state='on'] {
          background-color: rgba(0, 0, 0, 0.1);
        }
      `}
    >
      {children}
    </ToggleGroup.Item>
  )
}

interface ToolBoxProps {
  selected: Tool | null
  onSelect: (value: Tool | null) => void
}

export function ToolBox({ selected, onSelect }: ToolBoxProps) {
  const handleToolChange = (value: string) => {
    switch (value) {
      case 'inspect':
        onSelect('inspect')
        break

      default:
        onSelect(null)
        break
    }
  }

  return (
    <div>
      <ToggleGroup.Root
        type="single"
        value={selected ?? ''}
        css={css`
          position: fixed;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          background-color: white;
          z-index: 9999999999;
        `}
        onValueChange={handleToolChange}
      >
        <ToolBoxButton value="inspect">
          <CursorArrowIcon />
        </ToolBoxButton>
      </ToggleGroup.Root>
    </div>
  )
}
