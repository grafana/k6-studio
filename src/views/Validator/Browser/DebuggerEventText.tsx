import { ClickPill, DoubleClickPill } from '@/components/Browser/ClickPill'
import { SelectOptions } from '@/components/Browser/SelectOptions'
import { Value } from '@/components/Browser/Value'
import { Kbd } from '@/components/primitives/Kbd'
import {
  AnyBrowserAction,
  BrowserAssertionEvent,
  BrowserDebuggerEvent,
} from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { BrowserActionLocator } from './BrowserActionLocator'
import { toClickDetails } from './BrowserActionText.utils'

interface BrowserActionTextProps {
  action: AnyBrowserAction
}

function BrowserActionText({ action }: BrowserActionTextProps) {
  switch (action.method) {
    case 'browserContext.*':
      return (
        <>
          Call <code>{action.name}</code> on browser context
        </>
      )

    case 'page.goto':
      return (
        <>
          Navigate to <strong>{action.url}</strong>
        </>
      )

    case 'page.reload':
      return <>Reload page</>

    case 'page.waitForNavigation':
      return <>Waiting for page navigation</>

    case 'page.waitForTimeout':
      return (
        <>
          Wait for <strong>{action.timeout}</strong> ms
        </>
      )

    case 'page.close':
      return <>Close page</>

    case 'page.*':
      return (
        <>
          Call <code>{action.name}</code> on page
        </>
      )

    case 'locator.check':
      return (
        <>
          Check <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.clear':
      return (
        <>
          Clear <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.click':
      return (
        <>
          <ClickPill details={toClickDetails(action)} /> on{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.dblclick':
      return (
        <>
          <DoubleClickPill details={toClickDetails(action)} /> on{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.fill':
      return (
        <>
          Fill <BrowserActionLocator locator={action.locator} /> with text{' '}
          <code>{`"${action.value}"`}</code>
        </>
      )

    case 'locator.focus':
      return (
        <>
          Focus on <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.hover':
      return (
        <>
          Hover over <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.press':
      return (
        <>
          Press key <Kbd>{`"${action.key}"`}</Kbd> on{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.selectOption':
      return (
        <>
          Select options <SelectOptions options={action.values} /> on{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.setChecked':
      return (
        <>
          Set {'"checked"'} to <code>{action.checked.toString()}</code> on{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.tap':
      return (
        <>
          Tap on <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.type':
      return (
        <>
          Type <code>{`"${action.text}"`}</code> into{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.uncheck':
      return (
        <>
          Uncheck <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.waitFor':
      return (
        <>
          Wait for element <BrowserActionLocator locator={action.locator} />
        </>
      )

    case 'locator.*':
      return (
        <>
          Call <code>{action.name}</code> on{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    default:
      return exhaustive(action)
  }
}

interface BrowserAssertionTextProps {
  event: BrowserAssertionEvent
}

function BrowserAssertionText({ event }: BrowserAssertionTextProps) {
  const { assertion } = event
  const actual = <Value value={event.actual} />
  const not = assertion.negated ? ' not' : ''

  switch (assertion.method) {
    case 'toBeChecked':
      return (
        <>
          Expect {actual} to{not} be checked
        </>
      )

    case 'toBeDisabled':
      return (
        <>
          Expect {actual} to{not} be disabled
        </>
      )

    case 'toBeEditable':
      return (
        <>
          Expect {actual} to{not} be editable
        </>
      )

    case 'toBeEmpty':
      return (
        <>
          Expect {actual} to{not} be empty
        </>
      )

    case 'toBeEnabled':
      return (
        <>
          Expect {actual} to{not} be enabled
        </>
      )

    case 'toBeHidden':
      return (
        <>
          Expect {actual} to{not} be hidden
        </>
      )

    case 'toBeVisible':
      return (
        <>
          Expect {actual} to{not} be visible
        </>
      )

    case 'toHaveAttribute':
      if (assertion.args.length === 2) {
        return (
          <>
            Expect {actual} to{not} have attribute{' '}
            <Value value={assertion.args[0]} /> equal to{' '}
            <Value value={assertion.args[1]} />
          </>
        )
      }
      return (
        <>
          Expect {actual} to{not} have attribute{' '}
          <Value value={assertion.args[0]} />
        </>
      )

    case 'toHaveText':
      return (
        <>
          Expect {actual} to{not} have text <Value value={assertion.args[0]} />
        </>
      )

    case 'toContainText':
      return (
        <>
          Expect {actual} to{not} contain text{' '}
          <Value value={assertion.args[0]} />
        </>
      )

    case 'toHaveTitle':
      return (
        <>
          Expect {actual} to{not} have title <Value value={assertion.args[0]} />
        </>
      )

    case 'toHaveValue':
      return (
        <>
          Expect {actual} to{not} have value <Value value={assertion.args[0]} />
        </>
      )

    case 'toBe':
      return (
        <>
          Expect {actual} to{not} be <Value value={assertion.args[0]} />
        </>
      )

    case 'toBeCloseTo':
      if (assertion.args.length === 2) {
        return (
          <>
            Expect {actual} to{not} be close to{' '}
            <Value value={assertion.args[0]} /> (precision:{' '}
            <Value value={assertion.args[1]} />)
          </>
        )
      }

      return (
        <>
          Expect {actual} to{not} be close to{' '}
          <Value value={assertion.args[0]} />
        </>
      )

    case 'toBeGreaterThan':
      return (
        <>
          Expect {actual} to{not} be greater than{' '}
          <Value value={Number(assertion.args[0])} />
        </>
      )

    case 'toBeGreaterThanOrEqual':
      return (
        <>
          Expect {actual} to{not} be greater than or equal to{' '}
          <Value value={Number(assertion.args[0])} />
        </>
      )

    case 'toBeLessThan':
      return (
        <>
          Expect {actual} to{not} be less than{' '}
          <Value value={Number(assertion.args[0])} />
        </>
      )

    case 'toBeLessThanOrEqual':
      return (
        <>
          Expect {actual} to{not} be less than or equal to{' '}
          <Value value={Number(assertion.args[0])} />
        </>
      )

    case 'toBeDefined':
      return (
        <>
          Expect {actual} to{not} be defined
        </>
      )

    case 'toBeFalsy':
      return (
        <>
          Expect {actual} to{not} be falsy
        </>
      )

    case 'toBeInstanceOf':
      return (
        <>
          Expect {actual} to{not} be an instance of{' '}
          <Value value={assertion.args[0]} />
        </>
      )

    case 'toBeNaN':
      return (
        <>
          Expect {actual} to{not} be NaN
        </>
      )

    case 'toBeNull':
      return (
        <>
          Expect {actual} to{not} be null
        </>
      )

    case 'toBeTruthy':
      return (
        <>
          Expect {actual} to{not} be truthy
        </>
      )

    case 'toBeUndefined':
      return (
        <>
          Expect {actual} to{not} be undefined
        </>
      )

    case 'toEqual':
      return (
        <>
          Expect {actual} to{not} be equal to{' '}
          <Value value={assertion.args[0]} />
        </>
      )

    case 'toContain':
      return (
        <>
          Expect {actual} to{not} contain <Value value={assertion.args[0]} />
        </>
      )

    case 'toContainEqual':
      return (
        <>
          Expect {actual} to{not} contain an item equal to{' '}
          <Value value={assertion.args[0]} />
        </>
      )

    case 'toHaveLength':
      return (
        <>
          Expect {actual} to{not} have length{' '}
          <Value value={assertion.args[0]} />
        </>
      )

    case 'toHaveProperty':
      if (assertion.args.length === 2) {
        return (
          <>
            Expect {actual} to{not} have property{' '}
            <Value value={assertion.args[0]} /> equal to{' '}
            <Value value={assertion.args[1]} />
          </>
        )
      }

      return (
        <>
          Expect {actual} to{not} have property{' '}
          <Value value={assertion.args[0]} />
        </>
      )

    case '*':
      return (
        <>
          Expect {actual} to{not} pass <code>{assertion.name}</code>
        </>
      )

    default:
      return exhaustive(assertion)
  }
}

interface DebuggerEventTextProps {
  event: BrowserDebuggerEvent
}

export function DebuggerEventText({ event }: DebuggerEventTextProps) {
  if (event.type === 'action') {
    return <BrowserActionText action={event.action} />
  }

  return <BrowserAssertionText event={event} />
}
