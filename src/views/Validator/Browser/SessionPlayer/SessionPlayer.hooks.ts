import {
  DependencyList,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Replayer, ReplayerEvents } from 'rrweb'

import { BrowserReplayEvent } from '@/main/runner/schema'

export function useViewportScale(mount: HTMLElement | null) {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    if (mount === null || mount.parentElement === null) {
      return
    }

    const scaleToFitParent = (target: HTMLElement) => {
      if (target.parentElement === null) {
        return
      }

      const parentWidth = target.parentElement.clientWidth
      const parentHeight = target.parentElement.clientHeight

      const elementWidth = target.offsetWidth
      const elementHeight = target.offsetHeight

      const scaleX = parentWidth / elementWidth
      const scaleY = parentHeight / elementHeight

      const scale = Math.min(scaleX, scaleY, 1)

      setScale(scale)
    }

    scaleToFitParent(mount)

    const observer = new ResizeObserver(() => {
      scaleToFitParent(mount)
    })

    observer.observe(mount.parentElement)
    observer.observe(mount)

    return () => {
      observer.disconnect()
    }
  }, [mount])

  return scale
}

interface PlayerEventOptions {
  player: Replayer | null
  dependencies: DependencyList
  handler: (ev: unknown) => void
}

export function usePlayerEvent(
  event: ReplayerEvents,
  { player, handler, dependencies }: PlayerEventOptions
) {
  const handlerRef = useRef(handler)

  // Only update the handler when dependencies change, similar
  // to how useMemo and useCallback work. This ensure that we
  // don't re-register the event listener on every render.
  useEffect(() => {
    handlerRef.current = handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  useEffect(() => {
    if (player === null) {
      return
    }

    const eventListener = (ev: unknown) => {
      handlerRef.current(ev)
    }

    player.on(event, eventListener)

    return () => {
      player.off(event, eventListener)
    }
  }, [event, player])
}

export function useReplayEventSync(
  player: Replayer | null,
  events: BrowserReplayEvent[]
) {
  const lastIndexRef = useRef<number | null>(null)

  useEffect(() => {
    if (player === null) {
      return
    }

    // If the player was just created, then the events are already loaded and
    // we keep track of the last index.
    if (lastIndexRef.current === null) {
      lastIndexRef.current = events.length

      return
    }

    for (let i = lastIndexRef.current; i < events.length; ++i) {
      const event = events[i]

      if (event === undefined) {
        continue
      }

      player.addEvent(event)
    }

    lastIndexRef.current = events.length
  }, [player, events])
}
