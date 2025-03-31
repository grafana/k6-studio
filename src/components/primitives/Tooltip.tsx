import styled from '@emotion/styled'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { ReactNode } from 'react'

import { useContainerElement } from './ContainerProvider'

function Root(props: RadixTooltip.TooltipProps) {
  return (
    <RadixTooltip.TooltipProvider>
      <RadixTooltip.Root {...props} />
    </RadixTooltip.TooltipProvider>
  )
}

function Portal(props: Omit<RadixTooltip.TooltipPortalProps, 'container'>) {
  const container = useContainerElement()

  return <RadixTooltip.Portal container={container} {...props} />
}

const Trigger = styled(RadixTooltip.Trigger)`
  font-size: inherit;
  border: none;
  color: inherit;
  padding: 0;
  background-color: inherit;
`

const Content = styled(RadixTooltip.Content)`
  z-index: var(--studio-layer-3);
  border-radius: 2px;
  font-size: var(--studio-font-size-1);
  background-color: var(--studio-foreground);
  color: var(--studio-background);
  box-shadow: var(--studio-shadow-1);
  padding: var(--studio-spacing-1) var(--studio-spacing-2);
`

const Arrow = styled(RadixTooltip.Arrow)`
  fill: var(--studio-foreground);
`

interface TooltipProps {
  open?: boolean
  content: string
  children: ReactNode
  onOpenChange?: (open: boolean) => void
}

function SimpleTooltip({
  open,
  content,
  children,
  onOpenChange,
}: TooltipProps) {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Trigger>{children}</Trigger>
      <Portal>
        <Content>
          <Arrow /> {content}
        </Content>
      </Portal>
    </Root>
  )
}

export const Tooltip = Object.assign(SimpleTooltip, {
  Root,
  Trigger,
  Content,
  Arrow,
  Portal,
})
