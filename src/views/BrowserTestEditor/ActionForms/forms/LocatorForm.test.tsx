import { Theme } from '@radix-ui/themes'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  HighlightLocatorProvider,
  useHighlightedLocator,
} from '@/components/HighlightLocatorProvider'
import { cssLocatorOptions, LocatorOptions } from '@/schemas/locator'

import { FrameChainProvider } from '../../FrameChainContext'

import { LocatorForm } from './LocatorForm'

function HighlightProbe() {
  const highlighted = useHighlightedLocator()

  return <div data-testid="highlight-probe">{JSON.stringify(highlighted)}</div>
}

interface RenderOptions {
  locator?: LocatorOptions
  frames?: LocatorOptions[]
  withFrameEditing?: boolean
  suggestedRoles?: string[]
}

function renderLocatorForm({
  locator = cssLocatorOptions('button.pay'),
  frames,
  withFrameEditing = true,
  suggestedRoles,
}: RenderOptions = {}) {
  const onElementChange = vi.fn()
  const onFramesChange = vi.fn()

  function Harness() {
    const [state, setState] = useState(locator)
    const [frameState, setFrameState] = useState(frames)

    const handleElementChange = (value: LocatorOptions) => {
      onElementChange(value)
      setState(value)
    }

    const handleFramesChange = (value: LocatorOptions[] | undefined) => {
      onFramesChange(value)
      setFrameState(value)
    }

    const form = (
      <LocatorForm
        state={state}
        onChange={handleElementChange}
        suggestedRoles={suggestedRoles}
      />
    )

    return (
      <Theme>
        <HighlightLocatorProvider>
          <HighlightProbe />
          {withFrameEditing ? (
            <FrameChainProvider
              value={{ frames: frameState, onChange: handleFramesChange }}
            >
              {form}
            </FrameChainProvider>
          ) : (
            form
          )}
        </HighlightLocatorProvider>
      </Theme>
    )
  }

  return { ...render(<Harness />), onElementChange, onFramesChange }
}

function openPopover(badgeText = 'button.pay') {
  fireEvent.click(screen.getByText(badgeText))
}

const row = (name: string | RegExp) => screen.getByRole('button', { name })

const expanded = (name: string | RegExp) =>
  row(name).getAttribute('aria-expanded')

// The CSS selector textarea of the open accordion row. Only the open row's
// editor is mounted, so the bare role is unambiguous.
const selectorField = () => screen.getByRole<HTMLTextAreaElement>('textbox')

describe('LocatorForm chain accordion', () => {
  it('renders no chain controls when the frame chain has no onChange', () => {
    renderLocatorForm({ withFrameEditing: false })
    openPopover()

    expect(screen.queryByRole('button', { name: /add iframe/i })).toBeNull()
    expect(selectorField().value).toBe('button.pay')
  })

  it('renders the bare element form plus an add button when the chain is empty', () => {
    renderLocatorForm()
    openPopover()

    expect(screen.getByRole('button', { name: /add iframe/i })).toBeDefined()
    // No accordion when there are no frames — the element form shows directly.
    expect(screen.queryByRole('button', { name: /^element:/ })).toBeNull()
    expect(selectorField().value).toBe('button.pay')
  })

  it('switches to the accordion once the first frame is added', () => {
    renderLocatorForm()
    openPopover()

    fireEvent.click(screen.getByRole('button', { name: /add iframe/i }))

    expect(expanded(/^iframe 1/)).toBe('true')
    expect(expanded('element: button.pay')).toBe('false')
  })

  it('renders frame rows outermost-first plus the element row, element open', () => {
    renderLocatorForm({
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })
    openPopover()

    expect(expanded('iframe 1: #outer')).toBe('false')
    expect(expanded('iframe 2: #inner')).toBe('false')
    expect(expanded('element: button.pay')).toBe('true')
  })

  it('edits the element locator by default', () => {
    const { onElementChange, onFramesChange } = renderLocatorForm({
      frames: [cssLocatorOptions('#outer')],
    })
    openPopover()

    fireEvent.change(selectorField(), { target: { value: 'button.buy' } })

    expect(onElementChange).toHaveBeenCalledWith(
      cssLocatorOptions('button.buy')
    )
    expect(onFramesChange).not.toHaveBeenCalled()
  })

  it('expanding a frame row switches the editor to that frame', () => {
    const { onElementChange, onFramesChange } = renderLocatorForm({
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })
    openPopover()

    fireEvent.click(row('iframe 1: #outer'))

    expect(expanded('iframe 1: #outer')).toBe('true')
    expect(expanded('element: button.pay')).toBe('false')
    expect(selectorField().value).toBe('#outer')

    fireEvent.change(selectorField(), { target: { value: '#outer-edited' } })

    expect(onFramesChange).toHaveBeenCalledWith([
      cssLocatorOptions('#outer-edited'),
      cssLocatorOptions('#inner'),
    ])
    expect(onElementChange).not.toHaveBeenCalled()
  })

  it('expanding a frame does not mark untouched targets', () => {
    renderLocatorForm({ frames: [cssLocatorOptions('')] })
    openPopover()

    fireEvent.click(row(/^iframe 1/))
    fireEvent.click(row(/^element/))

    expect(screen.queryByText('CSS selector cannot be empty')).toBeNull()
  })

  it('add iframe appends an empty css frame and opens it', () => {
    const { onFramesChange } = renderLocatorForm({
      frames: [cssLocatorOptions('#outer')],
    })
    openPopover()

    fireEvent.click(screen.getByRole('button', { name: /add iframe/i }))

    expect(onFramesChange).toHaveBeenCalledWith([
      cssLocatorOptions('#outer'),
      cssLocatorOptions(''),
    ])
    expect(expanded(/^iframe 2/)).toBe('true')
    expect(selectorField().value).toBe('')
  })

  it('removing the open frame opens the element row', () => {
    const { onFramesChange } = renderLocatorForm({
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })
    openPopover()

    fireEvent.click(row('iframe 2: #inner'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove iframe 2' }))

    expect(onFramesChange).toHaveBeenCalledWith([cssLocatorOptions('#outer')])
    expect(expanded('element: button.pay')).toBe('true')
    expect(selectorField().value).toBe('button.pay')
  })

  it('removing a collapsed frame keeps the open frame selected', () => {
    renderLocatorForm({
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })
    openPopover()

    fireEvent.click(row('iframe 2: #inner'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove iframe 1' }))

    expect(expanded('iframe 1: #inner')).toBe('true')
    expect(selectorField().value).toBe('#inner')
  })

  it('keeps a frame error visible across row switches once touched', () => {
    renderLocatorForm({ frames: [cssLocatorOptions('#outer')] })
    openPopover()

    fireEvent.click(row('iframe 1: #outer'))
    fireEvent.change(selectorField(), { target: { value: '' } })
    fireEvent.blur(selectorField())

    expect(screen.getByText('CSS selector cannot be empty')).toBeDefined()

    fireEvent.click(row(/^element/))

    expect(screen.queryByText('CSS selector cannot be empty')).toBeNull()

    fireEvent.click(row(/^iframe 1/))

    expect(screen.getByText('CSS selector cannot be empty')).toBeDefined()
  })

  it('surfaces a frame error on the badge', () => {
    const { container } = renderLocatorForm({ frames: [cssLocatorOptions('')] })
    openPopover()

    expect(container.querySelector('.lucide-triangle-alert')).toBeNull()

    fireEvent.click(row(/^iframe 1/))
    fireEvent.blur(selectorField())

    expect(container.querySelector('.lucide-triangle-alert')).not.toBeNull()
  })
})

describe('LocatorForm highlight scoping', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const probe = () => {
    const text = screen.getByTestId('highlight-probe').textContent

    return JSON.parse(text ?? 'null') as unknown
  }

  const settleHighlight = () => {
    act(() => {
      vi.advanceTimersByTime(150)
    })
  }

  it('highlights the element scoped to the full chain when opened', () => {
    renderLocatorForm({
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })
    openPopover()

    settleHighlight()

    expect(probe()).toEqual({
      locator: { type: 'css', selector: 'button.pay' },
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })
  })

  it('highlights a frame scoped to the frames before it when hovered', () => {
    renderLocatorForm({
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })
    openPopover()

    fireEvent.pointerEnter(row('iframe 2: #inner'))

    settleHighlight()

    expect(probe()).toEqual({
      locator: { type: 'css', selector: '#inner' },
      frames: [cssLocatorOptions('#outer')],
    })
  })

  it('highlights the open frame with no parents after expanding the first frame', () => {
    renderLocatorForm({
      frames: [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')],
    })
    openPopover()

    fireEvent.click(row('iframe 1: #outer'))

    settleHighlight()

    expect(probe()).toEqual({
      locator: { type: 'css', selector: '#outer' },
      frames: [],
    })
  })
})

describe('LocatorForm suggested roles', () => {
  const roleLocator = (role: string): LocatorOptions => ({
    current: 'role',
    values: { role: { type: 'role', role, options: { exact: false } } },
  })

  const openRoleMenu = () => {
    const combobox = screen.getByRole('combobox')
    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
  }

  it('applies suggested roles only to the element form', () => {
    renderLocatorForm({
      locator: roleLocator('searchbox'),
      frames: [roleLocator('link')],
      suggestedRoles: ['checkbox'],
    })
    openPopover('searchbox')

    openRoleMenu()

    expect(screen.getByText('checkbox')).toBeDefined()
    expect(screen.queryByText('button')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /^iframe 1/ }))
    openRoleMenu()

    expect(screen.getByText('button')).toBeDefined()
  })
})
