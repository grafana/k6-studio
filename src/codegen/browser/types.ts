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

export type TestNode = PageNode | GotoNode | ReloadNode

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
