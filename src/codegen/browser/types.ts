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

export type TestNode =
  | PageNode
  | GotoNode
  | ReloadNode
  | LocatorNode
  | ClickNode

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
