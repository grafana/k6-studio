import { css } from '@emotion/react'
import styled from '@emotion/styled'
import * as RadixToolbar from '@radix-ui/react-toolbar'
import { forwardRef } from 'react'

type RootProps = RadixToolbar.ToolbarProps & {
  size?: '1' | '2'
}

const Root = forwardRef<HTMLDivElement, RootProps>(function Root(
  { size, ...props },
  ref
) {
  return (
    <RadixToolbar.Root
      ref={ref}
      css={css`
        display: flex;
        gap: var(--studio-spacing-1);
        align-items: center;

        &[data-orientation='vertical'] {
          flex-direction: column;
        }

        --studio-toolbar-button-padding: var(--studio-spacing-2);

        &[data-size='1'] {
          --studio-toolbar-button-padding: var(--studio-spacing-1);
        }
      `}
      {...props}
      data-size={size}
    />
  )
})

const Button = styled(RadixToolbar.Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: var(--studio-foreground);
  background-color: var(--studio-toggle-bg-off);
  border: none;
  padding: var(--studio-toolbar-button-padding);

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover {
    background-color: var(--studio-toggle-bg-on);
  }
`

const Link = styled(RadixToolbar.Link)``

const Separator = styled(RadixToolbar.Separator)`
  align-self: center;
  padding: 0 var(--studio-spacing-2);

  &:before {
    content: ' ';
    display: block;
    background-color: var(--gray-5);
    width: 1px;
    height: 12px;
  }

  &[data-orientation='horizontal']:before {
    width: 100%;
    height: 1px;
  }
`

const ToggleGroup = styled(RadixToolbar.ToggleGroup)`
  display: flex;
`

const ToggleItem = styled(RadixToolbar.ToggleItem)`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: var(--studio-foreground);
  background-color: var(--studio-toggle-bg-off);
  border: none;
  padding: var(--studio-toolbar-button-padding);

  &[data-state='on'],
  &:hover {
    background-color: var(--studio-toggle-bg-on);
  }
`

export const Toolbar = {
  Root,
  Button,
  Link,
  Separator,
  ToggleGroup,
  ToggleItem,
}
