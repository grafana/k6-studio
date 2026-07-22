import { useEffect, useRef, useState } from 'react'

import { BrowserEvent } from '@/schemas/recording'

export function useListenBrowserEvent(group?: string) {
  const [events, setEvents] = useState<BrowserEvent[]>([])
  const groupRef = useRef(group)

  useEffect(() => {
    // Create ref to avoid creating multiple listeners
    // for browser events
    groupRef.current = group
  }, [group])

  useEffect(() => {
    return window.studio.browser.onBrowserEvent((events: BrowserEvent[]) => {
      setEvents((prevEvents) => {
        // The full event list is re-sent on every update, so keep whatever
        // group was already assigned to events we've seen before and only
        // stamp new events with the currently active group.
        const prevGroupById = new Map(
          prevEvents.map((event) => [event.eventId, event.group])
        )

        return events.map((event) => ({
          ...event,
          group: prevGroupById.get(event.eventId) ?? groupRef.current,
        }))
      })
    })
  }, [])

  return events
}
