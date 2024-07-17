import { Tabs as RadixTabs } from '@radix-ui/themes'
import { ComponentProps } from 'react'

function Root({ children, ...props }: ComponentProps<typeof RadixTabs.Root>) {
  return (
    <RadixTabs.Root
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '0 1 auto',
        height: '100%',
        overflow: 'hidden',
      }}
      {...props}
    >
      {children}
    </RadixTabs.Root>
  )
}

function List({ children, ...props }: ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      {...props}
      style={{
        flex: '1 0 auto',
      }}
    >
      {children}
    </RadixTabs.List>
  )
}

function Content({
  children,
  value,
  ...props
}: ComponentProps<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      style={{ height: '100%', overflow: 'hidden', flex: '0 1 auto' }}
      value={value}
      {...props}
    >
      {children}
    </RadixTabs.Content>
  )
}

export const Tabs = {
  Root,
  List,
  Content,
  Trigger: RadixTabs.Trigger,
}
