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
}

export interface LocatorNode extends NodeBase {
  type: 'locator'
  locator: ElementLocator
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
