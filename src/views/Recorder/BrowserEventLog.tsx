import { Flex, ScrollArea } from '@radix-ui/themes'

import { BrowserEventList } from '@/components/BrowserEventList'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'
import { Group } from '@/types'

interface BrowserEventLogProps {
  events: BrowserEvent[]
  groups?: Group[]
}

export function BrowserEventLog({ events, groups }: BrowserEventLogProps) {
  const handleNavigate = (url: string) => {
    window.studio.browserRemote.navigateTo(url)
  }

  const handleHighlight = (
    locator: ElementLocator | null,
    frames?: LocatorOptions[]
  ) => {
    window.studio.browserRemote.highlightElement(locator, frames)
  }

  return (
    <Flex direction="column" minHeight="0" height="100%">
      <ScrollArea>
        <BrowserEventList
          events={events}
          groups={groups}
          onNavigate={handleNavigate}
          onHighlight={handleHighlight}
        />
      </ScrollArea>
    </Flex>
  )
}
