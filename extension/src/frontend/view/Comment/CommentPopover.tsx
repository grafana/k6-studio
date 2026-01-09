import { css } from '@emotion/react'
import { SendHorizontalIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { IconButton } from '@/components/primitives/IconButton'
import { Input } from '@/components/primitives/Input'

import { Position } from '../types'

interface CommentPopupProps {
  open: boolean
  position?: Position | null
  onClose: () => void
  onSubmit: (text: string) => void
}

export function CommentPopover({
  open,
  position,
  onClose,
  onSubmit,
}: CommentPopupProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    } else {
      setText('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = () => {
    const value = text.trim()
    if (value) {
      onSubmit(value)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      css={css`
        position: fixed;
        top: ${position?.top ?? 20}px;
        left: ${position?.left ?? 20}px;
        width: 320px;
        background: var(--gray-1);
        border: 1px solid var(--gray-7);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: var(--studio-layer-2);
      `}
    >
      <Flex gap="0" align="center">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          css={css`
            flex: 1;
            background: transparent;
            padding: 0;
            margin: 0;

            > input {
              padding: 13px;
              border: none;
              outline: none;

              &:focus {
                outline: none;
                box-shadow: none;
                border: none;
              }
            }
          `}
        />
        <IconButton
          onClick={handleSubmit}
          disabled={!text.trim()}
          css={css`
            width: 44px;
            height: 44px;
            border-radius: 0;
            color: ${text.trim() ? 'var(--orange-11)' : 'var(--gray-9)'};

            &:hover:not(:disabled) {
              color: var(--orange-12);
            }

            &:disabled {
              cursor: not-allowed;
              opacity: 0.5;
            }
          `}
        >
          <SendHorizontalIcon size={16} />
        </IconButton>
      </Flex>
    </div>
  )
}
