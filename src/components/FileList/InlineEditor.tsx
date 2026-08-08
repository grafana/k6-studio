import { Interpolation, Theme } from '@emotion/react'
import { Box, Reset } from '@radix-ui/themes'
import { useState, useEffect, Ref, useRef } from 'react'
import { useClickAway, useKeyPressEvent } from 'react-use'

import { mergeRefs } from '@/utils/react'

interface InlineEditorProps {
  ref: Ref<HTMLInputElement | null>
  value: string
  onCancel: () => void
  onSave: (value: string) => void
  style?: Interpolation<Theme>
  disableClickAway?: boolean
}

export function InlineEditor({
  ref,
  value,
  onCancel,
  onSave,
  style,
  disableClickAway = false,
}: InlineEditorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [localValue, setValue] = useState(value)

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [])

  useClickAway(inputRef, () => {
    if (!disableClickAway) {
      onCancel()
    }
  })

  useKeyPressEvent('Escape', () => {
    onCancel()
  })

  useKeyPressEvent('Enter', () => {
    if (localValue === value || localValue.trim() === '') {
      onCancel()

      return
    }

    onSave(localValue)
  })

  return (
    <Box css={style}>
      <Reset>
        <input
          ref={mergeRefs(inputRef, ref)}
          value={localValue}
          onChange={(e) => setValue(e.target.value)}
          css={{
            outline: '1px solid var(--focus-8)',
          }}
        />
      </Reset>
    </Box>
  )
}
