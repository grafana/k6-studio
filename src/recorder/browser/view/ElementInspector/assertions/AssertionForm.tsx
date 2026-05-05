import { css } from '@emotion/react'
import { FormEvent, ReactNode } from 'react'

import { Button } from '@/components/primitives/Button'
import { Flex } from '@/components/primitives/Flex'

interface AssertionFormProps {
  children: ReactNode
  onCancel: () => void
  onSubmit: () => void
}

export function AssertionForm({
  children,
  onCancel,
  onSubmit,
}: AssertionFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    onSubmit()
  }

  return (
    <form
      css={css`
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--studio-spacing-2);
        padding: var(--studio-spacing-2);
      `}
      onSubmit={handleSubmit}
    >
      {children}
      <Flex justify="end" gap="1">
        <Button size="1" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="1">
          Add
        </Button>
      </Flex>
    </form>
  )
}
