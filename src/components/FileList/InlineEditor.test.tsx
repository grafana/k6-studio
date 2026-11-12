import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InlineEditor } from './InlineEditor'

describe('InlineEditor', () => {
  it('ignores Enter and Escape from the references dialog', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(
      <>
        <InlineEditor
          ref={null}
          value="recording"
          onSave={onSave}
          onCancel={onCancel}
          disableClickAway
        />
        <button>Update files</button>
      </>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'renamed' },
    })
    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: 'Escape' })

    expect(onSave).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('saves with Enter and cancels with Escape in the input', () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(
      <InlineEditor
        ref={null}
        value="recording"
        onSave={onSave}
        onCancel={onCancel}
      />
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'renamed' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onSave).toHaveBeenCalledWith('renamed')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
