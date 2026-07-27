import { Theme } from '@radix-ui/themes'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  HighlightLocatorProvider,
  useHighlightedLocator,
} from '@/components/HighlightLocatorProvider'
import { LocatorClearAction } from '@/schemas/browserTest'
import {
  frameLocatorOptions,
  elementLocatorOptions,
  ElementLocatorOptions,
} from '@/schemas/locator'
import { newSyntheticKey, SyntheticKey } from '@/utils/zod'

import { LocatorForm } from './LocatorForm'

function HighlightProbe() {
  const highlighted = useHighlightedLocator()

  return <div data-testid="highlight-probe">{JSON.stringify(highlighted)}</div>
}

interface RenderOptions {
  locator?: ElementLocatorOptions
  suggestedRoles?: string[]
}

function buildAction(locator: ElementLocatorOptions): LocatorClearAction {
  return {
    id: 'action-1',
    method: 'locator.clear',
    locator,
  }
}

function renderLocatorForm({
  locator = elementLocatorOptions({ type: 'css', selector: 'button.pay' }),
  suggestedRoles,
}: RenderOptions = {}) {
  const onChange = vi.fn()

  function Harness() {
    const [action, setAction] = useState(buildAction(locator))

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
    // `parents` is stored innermost-first, so the outer frame (further from
    // the element) comes last.
    const inner = frameLocatorOptions({ type: 'css', selector: '#inner' })
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })

    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        inner,
        outer
      ),
    })
    openPopover()

    expect(expanded('iframe 1: #outer')).toBe('false')
    expect(expanded('iframe 2: #inner')).toBe('false')
    expect(expanded('element: button.pay')).toBe('true')
  })

  it('edits the element locator by default', () => {
    const locator = elementLocatorOptions(
      { type: 'css', selector: 'button.pay' },
      frameLocatorOptions({ type: 'css', selector: '#outer' })
    )

    const { onChange } = renderLocatorForm({ locator })
    openPopover()

    fireEvent.change(selectorField(), { target: { value: 'button.buy' } })

    // Editing keeps the original locator's key and parents — only its value
    // changes.
    expect(onChange).toHaveBeenCalledWith(
      buildAction({
        ...elementLocatorOptions(
          { type: 'css', selector: 'button.buy' },
          locator.parent
        ),
        key: locator.key,
      })
    )
  })

  it('expanding a frame row switches the editor to that frame', () => {
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })
    const inner = frameLocatorOptions(
      { type: 'css', selector: '#inner' },
      outer
    )

    const locator = elementLocatorOptions(
      { type: 'css', selector: 'button.pay' },
      inner
    )

    const { onChange } = renderLocatorForm({ locator })
    openPopover()

    fireEvent.click(row('iframe 1: #outer'))

    expect(expanded('iframe 1: #outer')).toBe('true')
    expect(expanded('element: button.pay')).toBe('false')
    expect(selectorField().value).toBe('#outer')

    fireEvent.change(selectorField(), { target: { value: '#outer-edited' } })

    // Editing the outermost frame keeps its key and the rest of the chain —
    // only its own value changes.
    expect(onChange).toHaveBeenCalledWith(
      buildAction({
        ...locator,
        parent: {
          ...inner,
          parent: {
            ...outer,
            values: { css: { type: 'css', selector: '#outer-edited' } },
          },
        },
      })
    )
  })

  it('expanding a frame does not mark untouched targets', () => {
    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        frameLocatorOptions({ type: 'css', selector: '' })
      ),
    })
    openPopover()

    fireEvent.click(row(/^iframe 1/))
    fireEvent.click(row(/^element/))

    expect(screen.queryByText('CSS selector cannot be empty')).toBeNull()
  })

  it('add iframe appends a new outermost frame and opens it', () => {
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })
    const locator = elementLocatorOptions(
      { type: 'css', selector: 'button.pay' },
      outer
    )

    const { onChange } = renderLocatorForm({ locator })
    openPopover()

    fireEvent.click(screen.getByRole('button', { name: /add iframe/i }))

    // The new frame is appended after existing parents (making it the new
    // outermost frame) and gets its own fresh key — only its content is
    // asserted.
    expect(onChange).toHaveBeenCalledWith(
      buildAction({
        ...locator,
        parent: {
          ...outer,
          parent: {
            type: 'frame',
            key: expect.any(String) as SyntheticKey,
            current: 'css',
            values: { css: { type: 'css', selector: '' } },
            parent: undefined,
          },
        },
      })
    )
    expect(expanded(/^iframe 1/)).toBe('true')
    expect(selectorField().value).toBe('')
  })

  it('removing the open frame opens the element row', () => {
    const inner = frameLocatorOptions({ type: 'css', selector: '#inner' })
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })
    const locator = elementLocatorOptions(
      { type: 'css', selector: 'button.pay' },
      inner,
      outer
    )

    const { onChange } = renderLocatorForm({ locator })
    openPopover()

    fireEvent.click(row('iframe 2: #inner'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove iframe 2' }))

    expect(onChange).toHaveBeenCalledWith(
      buildAction({ ...locator, parent: outer })
    )
    expect(expanded('element: button.pay')).toBe('true')
    expect(selectorField().value).toBe('button.pay')
  })

  it('removing a collapsed frame keeps the open frame selected', () => {
    const inner = frameLocatorOptions({ type: 'css', selector: '#inner' })
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })

    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        inner,
        outer
      ),
    })
    openPopover()

    fireEvent.click(row('iframe 2: #inner'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove iframe 1' }))

    expect(expanded('iframe 1: #inner')).toBe('true')
    expect(selectorField().value).toBe('#inner')
  })

  it('keeps a frame error visible across row switches once touched', () => {
    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        frameLocatorOptions({ type: 'css', selector: '#outer' })
      ),
    })
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

  it('marks the row being left touched even without blurring a field', () => {
    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        frameLocatorOptions({ type: 'css', selector: '' })
      ),
    })
    openPopover()

    fireEvent.click(row(/^iframe 1/))
    fireEvent.click(row(/^element/))
    fireEvent.click(row(/^iframe 1/))

    expect(screen.getByText('CSS selector cannot be empty')).toBeDefined()
  })

  it('switching between other rows does not surface an untouched frame error', () => {
    const outer = frameLocatorOptions({ type: 'css', selector: '' })
    const inner = frameLocatorOptions(
      { type: 'css', selector: '#inner' },
      outer
    )

    const { container } = renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        inner
      ),
    })
    openPopover()

    // Switch element -> inner frame -> element again, never visiting the
    // invalid outer frame.
    fireEvent.click(row('iframe 2: #inner'))
    fireEvent.click(row(/^element/))

    expect(container.querySelector('.lucide-triangle-alert')).toBeNull()
  })

  it('closing the popover touches frames the user never opened', () => {
    const { container } = renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        frameLocatorOptions({ type: 'css', selector: '' })
      ),
    })
    // Grab the trigger before opening — once open, the element row's own
    // header also renders "button.pay", making the text ambiguous.
    const trigger = screen.getByText('button.pay')

    fireEvent.click(trigger)
    expect(container.querySelector('.lucide-triangle-alert')).toBeNull()

    // Close without ever expanding the invalid frame row.
    fireEvent.click(trigger)

    expect(container.querySelector('.lucide-triangle-alert')).not.toBeNull()
  })

  it('surfaces a frame error on the badge', () => {
    const { container } = renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        frameLocatorOptions({ type: 'css', selector: '' })
      ),
    })
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
    const inner = frameLocatorOptions({ type: 'css', selector: '#inner' })
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })

    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        inner,
        outer
      ),
    })
    openPopover()

    settleHighlight()

    expect(probe()).toEqual({
      locator: { type: 'css', selector: 'button.pay' },
      // The highlight provider wants frames outermost-first. Each node in the
      // chain still carries its own `.parent` pointer, so `inner` here has
      // `outer` attached rather than matching the standalone `inner` fixture.
      frames: [outer, { ...inner, parent: outer }],
    })
  })

  it('highlights a frame scoped to the frames before it when hovered', () => {
    const inner = frameLocatorOptions({ type: 'css', selector: '#inner' })
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })

    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        inner,
        outer
      ),
    })
    openPopover()

    fireEvent.pointerEnter(row('iframe 2: #inner'))

    settleHighlight()

    expect(probe()).toEqual({
      locator: { type: 'css', selector: '#inner' },
      frames: [outer],
    })
  })

  it('highlights the open frame with no parents after expanding the first frame', () => {
    const inner = frameLocatorOptions({ type: 'css', selector: '#inner' })
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })

    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        inner,
        outer
      ),
    })
    openPopover()

    fireEvent.click(row('iframe 1: #outer'))

    settleHighlight()

    expect(probe()).toEqual({
      locator: { type: 'css', selector: '#outer' },
      frames: [],
    })
  })

  it('clears the highlight once the hovered frame is removed from the chain', () => {
    const inner = frameLocatorOptions({ type: 'css', selector: '#inner' })
    const outer = frameLocatorOptions({ type: 'css', selector: '#outer' })

    renderLocatorForm({
      locator: elementLocatorOptions(
        { type: 'css', selector: 'button.pay' },
        inner,
        outer
      ),
    })
    openPopover()

    // Hover (without leaving) the inner frame, then remove it — the hovered
    // key is now stale, pointing at a frame no longer in the chain.
    fireEvent.pointerEnter(row('iframe 2: #inner'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove iframe 2' }))

    settleHighlight()

    expect(probe()).toBeNull()
  })
})

describe('LocatorForm suggested roles', () => {
  const roleLocator = (role: string): ElementLocatorOptions => ({
    type: 'element',
    key: newSyntheticKey(),
    current: 'role',
    values: { role: { type: 'role', role, options: { exact: false } } },
  })

  const roleFrame = (role: string) => ({
    type: 'frame' as const,
    key: newSyntheticKey(),
    current: 'role' as const,
    values: {
      role: { type: 'role' as const, role, options: { exact: false } },
    },
  })

  const openRoleMenu = () => {
    const combobox = screen.getByRole('combobox')
    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
  }

  it('applies suggested roles only to the element form', () => {
    renderLocatorForm({
      locator: { ...roleLocator('searchbox'), parent: roleFrame('link') },
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
