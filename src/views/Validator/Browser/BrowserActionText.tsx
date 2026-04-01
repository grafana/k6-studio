import { ClickPill, DoubleClickPill } from '@/components/Browser/ClickPill'
import { SelectOptions } from '@/components/Browser/SelectOptions'
import { Kbd } from '@/components/primitives/Kbd'
import { AnyBrowserAction } from '@/main/runner/schema'
import { NodeSelector } from '@/schemas/selectors'
import { exhaustive } from '@/utils/typescript'

import { BrowserActionLocator } from './BrowserActionLocator'
import { toClickDetails } from './BrowserActionText.utils'

interface BrowserActionTextProps {
  action: AnyBrowserAction
  onHighlight?: (selector: NodeSelector | null) => void
}

export function BrowserActionText({
  action,
  onHighlight,
}: BrowserActionTextProps) {
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
          Check{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.clear':
      return (
        <>
          Clear{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.click':
      return (
        <>
          <ClickPill details={toClickDetails(action)} /> on{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.dblclick':
      return (
        <>
          <DoubleClickPill details={toClickDetails(action)} /> on{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.fill':
      return (
        <>
          Fill{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />{' '}
          with text <code>{`"${action.value}"`}</code>
        </>
      )

    case 'locator.focus':
      return (
        <>
          Focus on{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.hover':
      return (
        <>
          Hover over{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.press':
      return (
        <>
          Press key <Kbd>{`"${action.key}"`}</Kbd> on{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.selectOption':
      return (
        <>
          Select options <SelectOptions options={action.values} /> on{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.setChecked':
      return (
        <>
          Set {'"checked"'} to <code>{action.checked.toString()}</code> on{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.tap':
      return (
        <>
          Tap on{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.type':
      return (
        <>
          Type <code>{`"${action.text}"`}</code> into{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.uncheck':
      return (
        <>
          Uncheck{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.waitFor':
      return (
        <>
          Wait for element{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    case 'locator.*':
      return (
        <>
          Call <code>{action.name}</code> on{' '}
          <BrowserActionLocator
            locator={action.locator}
            onHighlight={onHighlight}
          />
        </>
      )

    default:
      return exhaustive(action)
  }
}
