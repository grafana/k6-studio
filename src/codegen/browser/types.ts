import { BrowserTestOptions } from '@/schemas/browserTest'
import { ElementLocator } from '@/schemas/locator'
import { CheckState, NavigateToPageEvent } from '@/schemas/recording'

export type NodeId = string

interface NodeBase {
  nodeId: NodeId
}

export interface NodeRef {
  nodeId: NodeId
}

export interface TraceNode extends NodeBase {
  type: 'trace'
  traceId: string
  inputs: {
    previous: NodeRef
  }
}

export interface PageNode extends NodeBase {
  type: 'page'
  // When set, the page was opened by a previous action (e.g. a click on a
  // target="_blank" link) and is obtained by awaiting the referenced
  // new-tab-promise instead of calling browser.newPage().
  promise?: NodeRef
}

// A promise for the next page opened in the browser context. It must be
// created before the action that opens the page and is awaited by the
// PageNode that references it. The page input is the page whose context is
// waited on; it also keeps that page alive until the new page has been
// obtained.
export interface NewTabPromiseNode extends NodeBase {
  type: 'new-tab-promise'
  inputs: {
    page: NodeRef
  }
}

export interface LocatorNode extends NodeBase {
  type: 'locator'
  locator: ElementLocator
  // Chain of iframe locators from the page down to the frame the element lives
  // in, outermost first. Empty or absent means the top frame.
  frames?: ElementLocator[]
  inputs: {
    page: NodeRef
  }
}

export interface GotoNode extends NodeBase {
  type: 'goto'
  url: string
  source: Exclude<NavigateToPageEvent['source'], 'implicit'>
  inputs: {
    previous?: NodeRef
    page: NodeRef
  }
}

export interface ReloadNode extends NodeBase {
  type: 'reload'
  inputs: {
    previous?: NodeRef
    page: NodeRef
  }
}

export interface ClickNode extends NodeBase {
  type: 'click'
  button: 'left' | 'middle' | 'right'
  modifiers: {
    ctrl: boolean
    shift: boolean
    alt: boolean
    meta: boolean
  }
  waitForNavigation?: {
    page: NodeRef
  }
  inputs: {
    previous?: NodeRef
    locator: NodeRef
  }
}

export interface TypeTextNode extends NodeBase {
  type: 'type-text'
  value: string
  inputs: {
    previous?: NodeRef
    locator: NodeRef
  }
}

export interface SelectOptionsNode extends NodeBase {
  type: 'select-options'
  selected: (string | { value?: string; label?: string; index?: number })[]
  multiple: boolean
  inputs: {
    previous?: NodeRef
    locator: NodeRef
  }
}

export interface CheckNode extends NodeBase {
  type: 'check'
  checked: boolean
  inputs: {
    previous?: NodeRef
    locator: NodeRef
  }
}

export interface TextContainsAssertion {
  type: 'text-contains'
  value: string
}

export interface IsVisibleAssertion {
  type: 'is-visible'
  visible: boolean
}

export interface IsCheckedAssertion {
  type: 'is-checked'
  inputType: 'aria' | 'native'
  expected: CheckState
}

export interface HasValueAssertion {
  type: 'has-value'
  expected: string
}

export interface HasValuesAssertion {
  type: 'has-values'
  expected: [string, ...string[]]
}

export type AssertionOperation =
  | TextContainsAssertion
  | IsVisibleAssertion
  | IsCheckedAssertion
  | HasValueAssertion
  | HasValuesAssertion

export interface ExpectNode extends NodeBase {
  type: 'expect'
  inputs: {
    locator: NodeRef
  }
}

export interface AssertNode extends NodeBase {
  type: 'assert'
  operation: AssertionOperation
  inputs: {
    previous?: NodeRef
    expect: NodeRef
  }
}

export interface ClearNode extends NodeBase {
  type: 'clear'
  inputs: {
    previous?: NodeRef
    locator: NodeRef
  }
}

export interface WaitForNode extends NodeBase {
  type: 'wait-for'
  inputs: {
    previous?: NodeRef
    locator: NodeRef
  }
  options?: {
    timeout?: number
    state?: 'attached' | 'detached' | 'visible' | 'hidden'
  }
}

export interface WaitForTimeoutNode extends NodeBase {
  type: 'wait-for-timeout'
  timeout: number
  inputs: {
    previous?: NodeRef
    page: NodeRef
  }
}

export type TestNode =
  | TraceNode
  | PageNode
  | NewTabPromiseNode
  | GotoNode
  | ReloadNode
  | LocatorNode
  | ClearNode
  | ClickNode
  | TypeTextNode
  | SelectOptionsNode
  | CheckNode
  | ExpectNode
  | AssertNode
  | WaitForNode
  | WaitForTimeoutNode

export interface Scenario {
  nodes: TestNode[]
}

export type DefaultScenario = Scenario & {
  name?: string
}

export interface Test {
  defaultScenario?: DefaultScenario
  scenarios: Record<string, Scenario>
  options?: BrowserTestOptions
}
