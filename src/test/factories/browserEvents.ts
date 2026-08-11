import {
  ClickEvent,
  InputChangeEvent,
  NavigateToPageEvent,
  TabOpenedEvent,
} from '@/schemas/recording'

export function createNavigateToPageEvent(
  overrides?: Partial<NavigateToPageEvent>
): NavigateToPageEvent {
  return {
    type: 'navigate-to-page',
    eventId: 'navigate-1',
    timestamp: 0,
    tab: 'tab1',
    url: 'https://example.com/',
    source: 'address-bar',
    ...overrides,
  }
}

export function createClickEvent(overrides?: Partial<ClickEvent>): ClickEvent {
  return {
    type: 'click',
    eventId: 'click-1',
    timestamp: 0,
    tab: 'tab1',
    target: { selectors: { css: 'button.submit' } },
    button: 'left',
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
    ...overrides,
  }
}

export function createTabOpenedEvent(
  overrides?: Partial<TabOpenedEvent>
): TabOpenedEvent {
  return {
    type: 'tab-opened',
    eventId: 'tab-opened-1',
    timestamp: 0,
    tab: 'tab2',
    ...overrides,
  }
}

export function createInputChangeEvent(
  overrides?: Partial<InputChangeEvent>
): InputChangeEvent {
  return {
    type: 'input-change',
    eventId: 'input-1',
    timestamp: 0,
    tab: 'tab1',
    target: { selectors: { css: 'input.search' } },
    value: 'placeholder',
    sensitive: false,
    ...overrides,
  }
}
