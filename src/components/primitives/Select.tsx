import { css } from '@emotion/react'
import styled from '@emotion/styled'
import * as RadixSelect from '@radix-ui/react-select'
import { clsx } from 'clsx'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { forwardRef } from 'react'

import { useContainerElement } from './ContainerProvider'

const Root = styled(RadixSelect.Root)``

type TriggerProps = RadixSelect.SelectTriggerProps & {
  size?: '1' | '2'
}

const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(function Trigger(
  { className, asChild, size = '2', children, ...props },
  ref
) {
  if (asChild) {
    return (
      <RadixSelect.Trigger asChild ref={ref} {...props}>
        {children}
      </RadixSelect.Trigger>
    )
  }

  return (
    <RadixSelect.Trigger
      ref={ref}
      className={clsx('studio-input', className)}
      css={css`
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
      `}
      data-size={size}
      {...props}
    >
      <RadixSelect.Value>{children}</RadixSelect.Value>
      <RadixSelect.Icon
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <ChevronDownIcon />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  )
})

const Value = styled(RadixSelect.Value)``

const Icon = styled(RadixSelect.Icon)``

const Portal = (props: Omit<RadixSelect.SelectProps, 'container'>) => {
  const container = useContainerElement()

  return <RadixSelect.Portal container={container} {...props} />
}

const Content = forwardRef<HTMLDivElement, RadixSelect.SelectContentProps>(
  function Content(props, ref) {
    return (
      <RadixSelect.Content
        ref={ref}
        css={css`
          z-index: var(--studio-layer-3);
          min-width: var(--radix-popper-anchor-width);
        `}
        position="popper"
        {...props}
      >
        <RadixSelect.ScrollUpButton>
          <ChevronUpIcon />
        </RadixSelect.ScrollUpButton>
        <RadixSelect.Viewport>{props.children}</RadixSelect.Viewport>
        <RadixSelect.ScrollDownButton>
          <ChevronDownIcon />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    )
  }
)

const Item = styled(RadixSelect.Item)``

const ItemText = styled(RadixSelect.ItemText)``

const ItemIndicator = styled(RadixSelect.ItemIndicator)``

const Group = styled(RadixSelect.Group)``

const Label = styled(RadixSelect.Label)``

const Separator = styled(RadixSelect.Separator)``

const Arrow = styled(RadixSelect.Arrow)``

export const Select = {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Item,
  ItemText,
  ItemIndicator,
  Group,
  Label,
  Separator,
  Arrow,
}
