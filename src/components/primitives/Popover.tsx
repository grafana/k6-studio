import styled from '@emotion/styled'
import * as RadixPopover from '@radix-ui/react-popover'

import { useContainerElement } from './ContainerProvider'

function Portal(props: Omit<RadixPopover.PopoverPortalProps, 'container'>) {
  const container = useContainerElement()

  return <RadixPopover.Portal {...props} container={container} />
}

const Root = styled(RadixPopover.Root)``

const Trigger = styled(RadixPopover.Trigger)``

const Anchor = styled(RadixPopover.Anchor)``

const Arrow = styled(RadixPopover.Arrow)`
  fill: var(--studio-popover-background);
`

const Content = styled(RadixPopover.Content)`
  z-index: var(--studio-popover-layer);
  color: var(--studio-popover-foreground);
  background-color: var(--studio-popover-background);
  box-shadow: var(--studio-popover-shadow);
  padding: var(--studio-popover-padding);
  user-select: none;
`

export const Popover = {
  Root,
  Trigger,
  Anchor,
  Portal,
  Arrow,
  Content,
}
