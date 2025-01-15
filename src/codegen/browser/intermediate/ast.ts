export interface Identifier {
  type: 'Identifier'
  name: string
}

export interface StringLiteral {
  type: 'StringLiteral'
  value: string
}

export interface NewPageExpression {
  type: 'NewPageExpression'
}

export interface GotoExpression {
  type: 'GotoExpression'
  target: Expression
  url: Expression
}

export interface ReloadExpression {
  type: 'ReloadExpression'
  target: Expression
}

export type Expression =
  | Identifier
  | StringLiteral
  | NewPageExpression
  | GotoExpression
  | ReloadExpression

export interface VariableDeclaration {
  type: 'VariableDeclaration'
  kind: 'const'
  name: string
  value: Expression
}

export type Declaration = VariableDeclaration

export interface ExpressionStatement {
  type: 'ExpressionStatement'
  expression: Expression
}

export type Statement = Declaration | ExpressionStatement

export type Node = Expression | Statement

export interface Scenario {
  type: 'Scenario'
  body: Statement[]
}

export type DefaultScenario = Scenario & {
  name?: string
}

export interface Test {
  defaultScenario?: DefaultScenario
  scenarios: Record<string, Scenario>
}
