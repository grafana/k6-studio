import { css } from '@emotion/react'
import { ReactNode } from 'react'

import { Button } from '@/components/primitives/Button'

interface AddAssertionFormProps {
  children: ReactNode
  onSubmit: () => void
}

export function AddAssertionForm({
  children,
  onSubmit,
}: AddAssertionFormProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    onSubmit()
  }

  return (
    <form
      css={css`
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--studio-spacing-1);
        padding: var(--studio-spacing-2);
      `}
      onSubmit={handleSubmit}
    >
      {children}
      <Button
        type="submit"
        size="1"
        css={css`
          align-self: flex-end;
        `}
      >
        Add
      </Button>
    </form>
  )
}
