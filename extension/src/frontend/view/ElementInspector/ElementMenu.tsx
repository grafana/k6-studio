import { css } from '@emotion/react'
import { EyeOpenIcon, TextIcon } from '@radix-ui/react-icons'
import { ToolbarButtonProps } from '@radix-ui/react-toolbar'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SquareDashedMousePointerIcon,
} from 'lucide-react'
import { ComponentProps } from 'react'

import { Toolbar } from '@/components/primitives/Toolbar'
import { Tooltip } from '@/components/primitives/Tooltip'

import { TrackedElement } from './ElementInspector.hooks'
import { AssertionData } from './assertions/types'

function ToolbarRoot(props: ComponentProps<typeof Toolbar.Root>) {
  return (
    <Toolbar.Root
      css={css`
        display: flex;
        align-items: stretch;
      `}
      {...props}
    />
  )
}

function ToolbarButton(props: ToolbarButtonProps) {
  return (
    <Toolbar.Button
      {...props}
      css={css`
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: var(--studio-spacing-2);
        padding: var(--studio-spacing-2);
        font-size: var(--studio-font-size-1);
      `}
    />
  )
}

interface ElementMenuProps {
  element: TrackedElement
  onSelectAssertion: (data: AssertionData) => void
  onSelectionDecrease?: () => void
  onSelectionIncrease?: () => void
}

export function ElementMenu({
  element,
  onSelectAssertion,
  onSelectionDecrease,
  onSelectionIncrease,
}: ElementMenuProps) {
  const handleAddVisibilityAssertion = () => {
    onSelectAssertion({
      type: 'visibility',
      selector: element.selector.css,
      state: 'visible',
    })
  }

  const handleAddTextAssertion = () => {
    onSelectAssertion({
      type: 'text',
      selector: element.selector.css,
      text: element.target.textContent ?? '',
    })
  }

  return (
    <ToolbarRoot
      size="1"
      orientation="vertical"
      css={css`
        gap: 0;
      `}
    >
      <ToolbarButton onClick={handleAddVisibilityAssertion}>
        <EyeOpenIcon /> <div>Add visibility assertion</div>
      </ToolbarButton>
      <ToolbarButton onClick={handleAddTextAssertion}>
        <TextIcon /> <div>Add text assertion</div>
      </ToolbarButton>
      <Toolbar.Separator />
      <div
        css={css`
          display: flex;
          gap: var(--studio-spacing-1);
          align-items: center;
          padding: var(--studio-spacing-1) var(--studio-spacing-2);
        `}
      >
        <div
          css={css`
            display: flex;
            gap: var(--studio-spacing-2);
            align-items: center;
            flex: 1 1 0;
          `}
        >
          <SquareDashedMousePointerIcon size={16} strokeWidth={1.5} />
          Selection
        </div>
        <Tooltip asChild content="Select parent element.">
          <div>
            <Toolbar.Button
              disabled={onSelectionIncrease === undefined}
              onClick={onSelectionIncrease}
            >
              <ChevronLeftIcon size={16} strokeWidth={1.5} />
            </Toolbar.Button>
          </div>
        </Tooltip>
        <Tooltip asChild content="Select child element.">
          <div>
            <Toolbar.Button
              disabled={onSelectionDecrease === undefined}
              onClick={onSelectionDecrease}
            >
              <ChevronRightIcon size={16} strokeWidth={1.5} />
            </Toolbar.Button>
          </div>
        </Tooltip>
      </div>
    </ToolbarRoot>
  )
}
