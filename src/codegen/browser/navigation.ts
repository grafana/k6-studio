import { BrowserEvent } from '@/schemas/recording'

export function isFollowedByImplicitNavigation(
  event: BrowserEvent,
  nextEvent?: BrowserEvent
): boolean {
  return (
    nextEvent?.type === 'navigate-to-page' &&
    nextEvent.source === 'implicit' &&
    nextEvent.tab === event.tab
  )
}
