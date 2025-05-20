import { css } from '@emotion/react'
import { ToolbarButtonProps } from '@radix-ui/react-toolbar'
import { CheckSquareIcon, EyeIcon, TypeIcon } from 'lucide-react'
import { ComponentProps, ReactNode } from 'react'

import { Toolbar } from '@/components/primitives/Toolbar'

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

function CategorySeparator({ children }: { children: ReactNode }) {
  return (
    <div
      role="separator"
      css={css`
        font-size: var(--studio-font-size-1);
        font-weight: var(--studio-font-weight-medium);
        display: flex;
        align-items: center;
        gap: var(--studio-spacing-2);
        padding: var(--studio-spacing-1);
        padding-right: 0;
      `}
    >
      {children}
    </div>
  )
}

interface ElementMenuProps {
  element: TrackedElement
  onSelectAssertion: (data: AssertionData) => void
}

export function ElementMenu({ element, onSelectAssertion }: ElementMenuProps) {
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

  const handleAddCheckAssertion = () => {
    onSelectAssertion({
      type: 'check',
      selector: element.selector.css,
      inputType: 'html',
      expected: 'checked',
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
      <CategorySeparator>Checkbox</CategorySeparator>
      <ToolbarButton onClick={handleAddCheckAssertion}>
        <CheckSquareIcon /> <div>Add check assertion</div>
      </ToolbarButton>
      <CategorySeparator>General</CategorySeparator>
      <ToolbarButton onClick={handleAddVisibilityAssertion}>
        <EyeIcon /> <div>Add visibility assertion</div>
      </ToolbarButton>
      <ToolbarButton onClick={handleAddTextAssertion}>
        <TypeIcon /> <div>Add text assertion</div>
      </ToolbarButton>
    </ToolbarRoot>
  )
}
