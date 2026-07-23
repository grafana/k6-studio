import { Theme } from '@radix-ui/themes'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  HighlightLocatorProvider,
  useHighlightedLocator,
} from '@/components/HighlightLocatorProvider'
import { LocatorClearAction } from '@/schemas/browserTest'
import { cssLocatorOptions, LocatorOptions } from '@/schemas/locator'
import { newSyntheticKey, SyntheticKey } from '@/utils/zod'

import { LocatorForm } from './LocatorForm'

function HighlightProbe() {
  const highlighted = useHighlightedLocator()

  return <div data-testid="highlight-probe">{JSON.stringify(highlighted)}</div>
}

interface RenderOptions {
  locator?: LocatorOptions
  frames?: LocatorOptions[]
  suggestedRoles?: string[]
}

function buildAction(
  locator: LocatorOptions,
  frames: LocatorOptions[] | undefined
): LocatorClearAction {
  return {
    id: 'action-1',
    method: 'locator.clear',
    locator,
    frames,
  }
}

function renderLocatorForm({
  locator = cssLocatorOptions('button.pay'),
  frames,
  suggestedRoles,
}: RenderOptions = {}) {
  const onChange = vi.fn()

  function Harness() {
    const [action, setAction] = useState(buildAction(locator, frames))

    const handleChange = (next: LocatorClearAction) => {
      onChange(next)
      setAction(next)
    }

    return (
      <Theme>
        <HighlightLocatorProvider>
          <HighlightProbe />
          <LocatorForm
            action={action}
            onChange={handleChange}
            suggestedRoles={suggestedRoles}
          />
        </HighlightLocatorProvider>
      </Theme>
    )
  }

  return { ...render(<Harness />), onChange }
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
  it('renders the bare element form plus an add button when the chain is empty', () => {
    renderLocatorForm({ frames: [] })
    openPopover()

    expect(screen.getByRole('button', { name: /add iframe/i })).toBeDefined()
    // No accordion when there are no frames — the element form shows directly.
    expect(screen.queryByRole('button', { name: /^element:/ })).toBeNull()
    expect(selectorField().value).toBe('button.pay')
  })

  it('switches to the accordion once the first frame is added', () => {
    renderLocatorForm({ frames: [] })
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
    const locator = cssLocatorOptions('button.pay')
    const outerFrame = cssLocatorOptions('#outer')
    const { onChange } = renderLocatorForm({
      locator,
      frames: [outerFrame],
    })
    openPopover()

    fireEvent.change(selectorField(), { target: { value: 'button.buy' } })

    // Editing keeps the original locator's key — only its value changes.
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        locator: { ...cssLocatorOptions('button.buy'), key: locator.key },
        frames: [outerFrame],
      })
    )
  })

  it('expanding a frame row switches the editor to that frame', () => {
    const locator = cssLocatorOptions('button.pay')
    const outer = cssLocatorOptions('#outer')
    const inner = cssLocatorOptions('#inner')
    const { onChange } = renderLocatorForm({
      locator,
      frames: [outer, inner],
    })
    openPopover()

    fireEvent.click(row('iframe 1: #outer'))

    expect(expanded('iframe 1: #outer')).toBe('true')
    expect(expanded('element: button.pay')).toBe('false')
    expect(selectorField().value).toBe('#outer')

    fireEvent.change(selectorField(), { target: { value: '#outer-edited' } })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        locator,
        frames: [
          { ...cssLocatorOptions('#outer-edited'), key: outer.key },
          inner,
        ],
      })
    )
  })

  it('expanding a frame does not mark untouched targets', () => {
    renderLocatorForm({ frames: [cssLocatorOptions('')] })
    openPopover()

    fireEvent.click(row(/^iframe 1/))
    fireEvent.click(row(/^element/))

    expect(screen.queryByText('CSS selector cannot be empty')).toBeNull()
  })

  it('add iframe appends an empty css frame and opens it', () => {
    const outer = cssLocatorOptions('#outer')
    const { onChange } = renderLocatorForm({ frames: [outer] })
    openPopover()

    fireEvent.click(screen.getByRole('button', { name: /add iframe/i }))

    // The new frame is appended after existing frames and gets its own fresh
    // key — only its content is asserted.
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frames: [
          outer,
          {
            key: expect.any(String) as SyntheticKey,
            current: 'css',
            values: { css: { type: 'css', selector: '' } },
          },
        ],
      })
    )
    expect(expanded(/^iframe 2/)).toBe('true')
    expect(selectorField().value).toBe('')
  })

  it('removing the open frame opens the element row', () => {
    const outer = cssLocatorOptions('#outer')
    const { onChange } = renderLocatorForm({
      frames: [outer, cssLocatorOptions('#inner')],
    })
    openPopover()

    fireEvent.click(row('iframe 2: #inner'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove iframe 2' }))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ frames: [outer] })
    )
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
    const frames = [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')]
    renderLocatorForm({ frames })
    openPopover()

    settleHighlight()

    expect(probe()).toEqual({
      locator: { type: 'css', selector: 'button.pay' },
      frames,
    })
  })

  it('highlights a frame scoped to the frames before it when hovered', () => {
    const frames = [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')]
    renderLocatorForm({ frames })
    openPopover()

    fireEvent.pointerEnter(row('iframe 2: #inner'))

    settleHighlight()

    expect(probe()).toEqual({
      locator: { type: 'css', selector: '#inner' },
      frames: [frames[0]],
    })
  })

  it('highlights the open frame with no parents after expanding the first frame', () => {
    const frames = [cssLocatorOptions('#outer'), cssLocatorOptions('#inner')]
    renderLocatorForm({ frames })
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
    key: newSyntheticKey(),
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
