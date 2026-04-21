import { css } from '@emotion/react'
import { Tabs as RadixTabs } from '@radix-ui/themes'

type PersistentTabsContentProps = RadixTabs.ContentProps & {
  persistent?: boolean
}

function Content({ persistent = true, ...props }: PersistentTabsContentProps) {
  if (!persistent) {
    return <RadixTabs.Content {...props} />
  }

  return (
    <RadixTabs.Content
      {...props}
      forceMount
      css={css`
        &[data-state='inactive'] {
          display: none;
        }
      `}
    />
  )
}

/**
 * A tabs component that only hides the inactive tab content instead of unmounting it.
 */
export const PersistentTabs = {
  Root: RadixTabs.Root,
  List: RadixTabs.List,
  Content: Content,
  Trigger: RadixTabs.Trigger,
}
