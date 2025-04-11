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
  fill: var(--studio-background);
`

const Content = styled(RadixPopover.Content)`
  z-index: var(--studio-layer-2);
  color: var(--studio-foreground);
  background-color: var(--studio-background);
  user-select: none;
  box-shadow: var(--studio-shadow-1);
  padding: var(--studio-spacing-2);
`

export const Popover = {
  Root,
  Trigger,
  Anchor,
  Portal,
  Arrow,
  Content,
}
