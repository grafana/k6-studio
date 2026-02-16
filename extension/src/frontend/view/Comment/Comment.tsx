import { nanoid } from 'nanoid'
import { useCallback, useState } from 'react'

import { getTabId } from '../../utils'
import { useGlobalClass } from '../GlobalStyles'
import { useStudioClient } from '../StudioClientProvider'
import { useEscape } from '../hooks/useEscape'
import { usePreventClick } from '../hooks/usePreventClick'

import { CommentPopover } from './CommentPopover'

interface CommentProps {
  onClose: () => void
}

export function Comment({ onClose }: CommentProps) {
  const client = useStudioClient()
  const [showPopover, setShowPopover] = useState(false)

  useGlobalClass('commenting')

  useEscape(() => {
    if (showPopover) {
      setShowPopover(false)
      return
    }
    onClose()
  }, [showPopover, onClose])

  usePreventClick({
    callback: () => {
      setShowPopover(true)
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
      setShowPopover(false)
      onClose()
    },
    [client, onClose]
  )

  return (
    <CommentPopover
      open={showPopover}
      onClose={() => setShowPopover(false)}
      onSubmit={handleSubmit}
    />
  )
}
