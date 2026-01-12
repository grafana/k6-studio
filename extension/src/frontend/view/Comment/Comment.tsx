import { nanoid } from 'nanoid'
import { useCallback, useState } from 'react'

import { getTabId } from '../../utils'
import { useGlobalClass } from '../GlobalStyles'
import { useStudioClient } from '../StudioClientProvider'
import { useEscape } from '../hooks/useEscape'
import { usePreventClick } from '../hooks/usePreventClick'
import { Position } from '../types'

import { CommentPopover } from './CommentPopover'

interface CommentProps {
  onClose: () => void
}

export function Comment({ onClose }: CommentProps) {
  const client = useStudioClient()
  const [clickPosition, setClickPosition] = useState<Position | null>(null)

  useGlobalClass('commenting')

  useEscape(() => {
    if (clickPosition !== null) {
      setClickPosition(null)
      return
    }
    onClose()
  }, [clickPosition, onClose])

  usePreventClick({
    callback: (ev) => {
      setClickPosition({
        top: ev.clientY + window.scrollY,
        left: ev.clientX + window.scrollX,
      })
    },
  })

  const handleSubmit = useCallback(
    (text: string) => {
      client.send({
        type: 'record-events',
        events: [
          {
            type: 'comment',
            eventId: nanoid(),
            timestamp: Date.now(),
            tab: getTabId(),
            text,
          },
        ],
      })
      setClickPosition(null)
      onClose()
    },
    [client, onClose]
  )

  return (
    <CommentPopover
      open={clickPosition !== null}
      position={clickPosition}
      onClose={() => setClickPosition(null)}
      onSubmit={handleSubmit}
    />
  )
}
