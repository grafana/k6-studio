import { Flex, ScrollArea } from '@radix-ui/themes'

import { BrowserEventList } from '@/components/BrowserEventList'
import { BrowserEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/frontend/view/types'

interface BrowserEventLogProps {
  events: BrowserEvent[]
}

export function BrowserEventLog({ events }: BrowserEventLogProps) {
  const handleNavigate = (url: string) => {
    window.studio.browser.navigateTo(url)
  }

  const handleHighlight = (selector: HighlightSelector | null) => {
    window.studio.browser.highlightElement(selector)
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
