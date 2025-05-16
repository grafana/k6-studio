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
  selector: string
  inputs: {
    page: NodeRef
  }
}

export interface GotoNode extends NodeBase {
  type: 'goto'
  url: string
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

export type AssertionOperation = TextContainsAssertion | IsVisibleAssertion

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
