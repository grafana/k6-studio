import styled from '@emotion/styled'
import * as RadixToolbar from '@radix-ui/react-toolbar'

const Button = styled(RadixToolbar.Button)``

const Link = styled(RadixToolbar.Link)``

const Root = styled(RadixToolbar.Root)`
  display: flex;
  gap: var(--studio-spacing-1);
  padding: var(--studio-spacing-1);

  &[data-orientation='vertical'] {
    flex-direction: column;
  }
`

const Separator = styled(RadixToolbar.Separator)`
  align-self: stretch;

  &:before {
    content: ' ';
    display: block;
    background-color: rgba(0, 0, 0, 0.2);
    width: 1px;
    height: 100%;
  }

  &[data-orientation='horizontal']:before {
    width: 100%;
    height: 1px;
  }
`

const ToggleGroup = styled(RadixToolbar.ToggleGroup)`
  display: flex;
  gap: var(--studio-spacing-1);
`

const ToggleItem = styled(RadixToolbar.ToggleItem)`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: var(--studio-toggle-bg-off);
  border: none;
  padding: var(--studio-spacing-2);

  &[data-state='on'] {
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
