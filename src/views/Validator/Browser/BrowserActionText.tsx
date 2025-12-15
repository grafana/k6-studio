import { ClickPill, DoubleClickPill } from '@/components/Browser/ClickPill'
import { SelectOptions } from '@/components/Browser/SelectOptions'
import { Kbd } from '@/components/primitives/Kbd'
import { AnyBrowserAction } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

import { BrowserActionLocator } from './BrowserActionLocator'
import { toClickDetails } from './BrowserActionText.utils'

interface BrowserActionTextProps {
  action: AnyBrowserAction
}

export function BrowserActionText({ action }: BrowserActionTextProps) {
  switch (action.method) {
    case 'browserContext.*':
      return <>Performed action {action.method} on browser context</>

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

    case 'page.*':
      return <>Performed action {action.method} on page</>

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
          <BrowserActionLocator locator={action.locator} /> to
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
          Performed action {action.method} on{' '}
          <BrowserActionLocator locator={action.locator} />
        </>
      )

    default:
      return exhaustive(action)
  }
}
