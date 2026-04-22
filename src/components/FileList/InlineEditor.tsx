import { Interpolation, Theme } from '@emotion/react'
import { Box, Reset } from '@radix-ui/themes'
import { useRef, useState, useEffect } from 'react'
import { useClickAway, useKeyPressEvent } from 'react-use'

export function InlineEditor({
  value,
  onCancel,
  onSave,
  style,
}: {
  value: string
  onCancel: () => void
  onSave: (value: string) => void
  style?: Interpolation<Theme>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setValue] = useState(value)

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [])

  useClickAway(inputRef, () => {
    onCancel()
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
          value={localValue}
          onChange={(e) => setValue(e.target.value)}
          css={{
            outline: '1px solid var(--focus-8)',
          }}
          ref={inputRef}
        />
      </Reset>
    </Box>
  )
}
