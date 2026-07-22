import { Flex, ScrollArea } from '@radix-ui/themes'

import { BrowserEventList } from '@/components/BrowserEventList'
import { ElementLocator, LocatorOptions } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'

interface BrowserEventLogProps {
  events: BrowserEvent[]
}

export function BrowserEventLog({ events }: BrowserEventLogProps) {
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
          onNavigate={handleNavigate}
          onHighlight={handleHighlight}
        />
      </ScrollArea>
    </Flex>
  )
}
