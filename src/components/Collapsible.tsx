import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { CaretRightIcon } from '@radix-ui/react-icons'
import { Reset } from '@radix-ui/themes'

const slideDown = keyframes`
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
`

const slideUp = keyframes`
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
`

const Header = styled.div`
  cursor: var(--cursor-button);
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;

  background-color: var(--gray-2);
  border-top: 1px solid var(--gray-3);
  border-bottom: 1px solid var(--gray-3);
`

const CaretIcon = styled(CaretRightIcon)`
  transform: rotate(0deg);

  [data-state='open'] & {
    transform: rotate(90deg);
  }
`

interface CaretProps {
  iconSize?: number
}

function Caret({ iconSize = 20 }: CaretProps) {
  return <CaretIcon height={iconSize} width={iconSize} />
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-2);
        flex: 1 1 0;
      `}
    >
      <Caret />
      {children}
    </div>
  )
}

function Trigger({
  children,
  ...props
}: RadixCollapsible.CollapsibleTriggerProps) {
  return (
    <Reset>
      <RadixCollapsible.Trigger
        {...props}
        asChild
        css={css`
          flex: 1 1 0;
          cursor: var(--cursor-button);
        `}
      >
        <button type="button">{children}</button>
      </RadixCollapsible.Trigger>
    </Reset>
  )
}

const Content = styled(RadixCollapsible.Content)`
  overflow: hidden;

  &[data-state='open'] {
    animation: ${slideDown} 150ms ease-out;
  }

  &[data-state='closed'] {
    animation: ${slideUp} 150ms ease-out;
  }
`

export const Collapsible = {
  Root: RadixCollapsible.Root,
  Trigger,
  Header,
  Heading,
  Content,
}
