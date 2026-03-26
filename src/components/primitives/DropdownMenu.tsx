import styled from '@emotion/styled'
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu'

import { useContainerElement } from './ContainerProvider'

function Portal(
  props: Omit<RadixDropdownMenu.DropdownMenuPortalProps, 'container'>
) {
  const container = useContainerElement()

  return <RadixDropdownMenu.Portal {...props} container={container} />
}

const Root = styled(RadixDropdownMenu.Root)``

const Trigger = styled(RadixDropdownMenu.Trigger)``

const Content = styled(RadixDropdownMenu.Content)`
  z-index: var(--studio-popover-layer);
  color: var(--studio-popover-foreground);
  background-color: var(--studio-popover-background);
  box-shadow: var(--studio-popover-shadow);
  padding: var(--studio-spacing-1);
  user-select: none;
  min-width: 200px;
`

const Label = styled(RadixDropdownMenu.Label)`
  font-size: var(--studio-font-size-1);
  font-weight: var(--studio-font-weight-medium);
  padding: var(--studio-spacing-2);
  color: var(--studio-foreground);
`

const Item = styled(RadixDropdownMenu.Item)`
  display: flex;
  align-items: center;
  gap: var(--studio-spacing-2);
  padding: var(--studio-spacing-2);
  font-size: var(--studio-font-size-1);
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: var(--studio-toggle-bg-on);
  }

  &[data-highlighted] {
    background-color: var(--studio-toggle-bg-on);
  }
`

const RadioGroup = styled(RadixDropdownMenu.RadioGroup)``

const RadioItem = styled(RadixDropdownMenu.RadioItem)`
  display: flex;
  align-items: center;
  gap: var(--studio-spacing-2);

  padding: var(--studio-spacing-2);
  padding-left: var(--studio-spacing-8);

  font-size: var(--studio-font-size-1);
  cursor: pointer;
  outline: none;
  position: relative;

  &:hover {
    background-color: var(--studio-toggle-bg-on);
  }

  &[data-highlighted] {
    background-color: var(--studio-toggle-bg-on);
  }
`

const ItemIndicator = styled(RadixDropdownMenu.ItemIndicator)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: var(--studio-spacing-2);
`

const Separator = styled(RadixDropdownMenu.Separator)`
  height: 1px;
  background-color: var(--gray-5);
  margin: var(--studio-spacing-1) 0;
`

export const DropdownMenu = {
  Root,
  Trigger,
  Portal,
  Content,
  Label,
  Item,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Separator,
}
