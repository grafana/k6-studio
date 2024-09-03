import { css } from '@emotion/react'
import { Box, Tabs as RadixTabs, ScrollArea } from '@radix-ui/themes'
import { ComponentProps } from 'react'

/**
 * This is a custom Tabs component that uses Radix Tabs under the hood.
 * It's very specific styles are required to successfully enable scrolling within the tabs.
 */
function Root({ children, ...props }: ComponentProps<typeof RadixTabs.Root>) {
  return (
    <RadixTabs.Root
      {...props}
      css={css`
        display: flex;
        flex-direction: column;
        flex: 0 1 auto;
        height: 100%;
        overflow: hidden;
      `}
    >
      {children}
    </RadixTabs.Root>
  )
}

function List({ children, ...props }: ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      {...props}
      css={css`
        flex-shrink: 0;
      `}
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
      {...props}
      css={css`
        flex: 1;
        min-height: 0;
      `}
      value={value}
    >
      <ScrollArea
        css={css`
          height: 100%;
        `}
      >
        <Box p="2" height="100%">
          {children}
        </Box>
      </ScrollArea>
    </RadixTabs.Content>
  )
}

export const Tabs = {
  Root,
  List,
  Content,
  Trigger: RadixTabs.Trigger,
}
