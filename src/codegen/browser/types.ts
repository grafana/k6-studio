import { CheckState, NavigateToPageEvent } from '@/schemas/recording'

import { NodeSelector } from './selectors'

export type NodeId = string

interface NodeBase {
  nodeId: NodeId
}

export interface NodeRef {
  nodeId: NodeId
}

export interface PageNode extends NodeBase {
  type: 'page'
}

export interface LocatorNode extends NodeBase {
  type: 'locator'
  selector: NodeSelector
  inputs: {
    page: NodeRef
  }
}

export interface GotoNode extends NodeBase {
  type: 'goto'
  url: string
  source: NavigateToPageEvent['source']
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
  triggersNavigation?: boolean
  inputs: {
    previous?: NodeRef
    locator: NodeRef
    page: NodeRef
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
  selected: string[]
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

export interface HasValuesAssertion {
  type: 'has-values'
  expected: [string, ...string[]]
}

export type AssertionOperation =
  | TextContainsAssertion
  | IsVisibleAssertion
  | IsCheckedAssertion
  | HasValuesAssertion

export interface AssertNode extends NodeBase {
  type: 'assert'
  operation: AssertionOperation
  inputs: {
    previous?: NodeRef
    locator: NodeRef
  }
}

export type TestNode =
  | PageNode
  | GotoNode
  | ReloadNode
  | LocatorNode
  | ClickNode
  | TypeTextNode
  | SelectOptionsNode
  | CheckNode
  | AssertNode

export interface Scenario {
  nodes: TestNode[]
}

export type DefaultScenario = Scenario & {
  name?: string
}

export interface Test {
  defaultScenario?: DefaultScenario
  scenarios: Record<string, Scenario>
}
