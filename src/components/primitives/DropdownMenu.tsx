import styled from '@emotion/styled'
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu'

import { useContainerElement } from './ContainerProvider'

const Root = styled(RadixDropdownMenu.Root)``

const Trigger = styled(RadixDropdownMenu.Trigger)``

function Portal({
  container,
  ...props
}: RadixDropdownMenu.DropdownMenuPortalProps) {
  const rootContainer = useContainerElement()

  return (
    <RadixDropdownMenu.Portal
      {...props}
      container={container ?? rootContainer}
    />
  )
}

const Content = styled(RadixDropdownMenu.Content)`
  z-index: var(--studio-popover-layer);
  color: var(--studio-popover-foreground);
  background-color: var(--studio-popover-background);
  box-shadow: var(--studio-popover-shadow);
  padding: var(--studio-popover-padding);
  user-select: none;

  --studio-dropdown-item-padding: var(--studio-spacing-2);
  --studio-dropdown-separator-padding: var(--studio-spacing-1);
`

const Arrow = styled(RadixDropdownMenu.Arrow)`
  fill: var(--studio-popover-background);
`

const Item = styled(RadixDropdownMenu.Item)`
  display: flex;
  align-items: center;
  padding: var(--studio-dropdown-item-padding);
  line-height: 1em;

  &:hover,
  &[data-highlighted] {
    background-color: var(--studio-accent-3);
  }

  & > svg:first-child {
    padding-right: var(--studio-dropdown-item-padding);
  }
`

const Group = styled(RadixDropdownMenu.Group)``

const Label = styled(RadixDropdownMenu.Label)`
  padding: var(--studio-dropdown-item-padding);

  font-weight: 500;
  color: var(--studio-foreground);
  font-size: var(--studio-font-size-1);
`

const CheckboxItem = styled(RadixDropdownMenu.CheckboxItem)``

const RadioGroup = styled(RadixDropdownMenu.RadioGroup)``

const RadioItem = styled(RadixDropdownMenu.RadioItem)``

const ItemIndicator = styled(RadixDropdownMenu.ItemIndicator)``

const Separator = styled(RadixDropdownMenu.Separator)`
  padding: var(--studio-dropdown-separator-padding) 0;

  &:before {
    content: ' ';
    display: block;
    width: 100%;
    height: 1px;
    background-color: var(--studio-border-color);
  }
`

const Sub = styled(RadixDropdownMenu.Sub)``

const SubTrigger = styled(RadixDropdownMenu.SubTrigger)``

const SubContent = styled(RadixDropdownMenu.SubContent)``

export const DropdownMenu = {
  Root,
  Trigger,
  Portal,
  Content,
  Arrow,
  Item,
  Group,
  Label,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Separator,
  Sub,
  SubTrigger,
  SubContent,
}
