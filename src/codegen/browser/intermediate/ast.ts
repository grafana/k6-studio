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

export interface NewCssLocatorExpression {
  type: 'NewCssLocatorExpression'
  selector: Expression
  page: Expression
}

export interface NewTestIdLocatorExpression {
  type: 'NewTestIdLocatorExpression'
  testId: Expression
  page: Expression
}

export interface NewAltTextLocatorExpression {
  type: 'NewAltTextLocatorExpression'
  text: Expression
  page: Expression
}

export interface NewLabelLocatorExpression {
  type: 'NewLabelLocatorExpression'
  text: Expression
  page: Expression
}

export interface NewPlaceholderLocatorExpression {
  type: 'NewPlaceholderLocatorExpression'
  text: Expression
  page: Expression
}

export interface NewTitleLocatorExpression {
  type: 'NewTitleLocatorExpression'
  text: Expression
  page: Expression
}

export interface NewRoleLocatorExpression {
  type: 'NewRoleLocatorExpression'
  role: Expression
  name: Expression
  page: Expression
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

export interface ClickOptionsExpression {
  type: 'ClickOptionsExpression'
  button: 'left' | 'middle' | 'right'
  modifiers: Array<'Control' | 'Shift' | 'Alt' | 'Meta'>
}

export interface FillTextExpression {
  type: 'FillTextExpression'
  target: Expression
  value: Expression
}

export interface ClickExpression {
  type: 'ClickExpression'
  locator: Expression
  options: Expression | null
}

export interface CheckExpression {
  type: 'CheckExpression'
  locator: Expression
  checked: Expression
}

export interface SelectOptionsExpression {
  type: 'SelectOptionsExpression'
  locator: Expression
  selected: Expression[]
  multiple: boolean
}

export interface WaitForNavigationExpression {
  type: 'WaitForNavigationExpression'
  target: Expression
}

export interface PromiseAllExpression {
  type: 'PromiseAllExpression'
  expressions: Expression[]
}

export interface TextContainsAssertion {
  type: 'TextContainsAssertion'
  text: Expression
}

export interface IsVisibleAssertion {
  type: 'IsVisibleAssertion'
}

export interface IsHiddenAssertion {
  type: 'IsHiddenAssertion'
}

export interface IsAttributeEqualToAssertion {
  type: 'IsAttributeEqualToAssertion'
  attribute: Expression
  value: Expression
}

export interface IsCheckedAssertion {
  type: 'IsCheckedAssertion'
}

export interface IsNotCheckedAssertion {
  type: 'IsNotCheckedAssertion'
}

export interface IsIndeterminateAssertion {
  type: 'IsIndeterminateAssertion'
}

export interface HasValueAssertion {
  type: 'HasValueAssertion'
  expected: [Expression, ...Expression[]]
}

export type Assertion =
  | TextContainsAssertion
  | IsVisibleAssertion
  | IsHiddenAssertion
  | IsAttributeEqualToAssertion
  | IsCheckedAssertion
  | IsNotCheckedAssertion
  | IsIndeterminateAssertion
  | HasValueAssertion

export interface ExpectExpression {
  type: 'ExpectExpression'
  actual: Expression
  expected: Assertion
}

export type Expression =
  | Identifier
  | StringLiteral
  | NewPageExpression
  | NewRoleLocatorExpression
  | NewLabelLocatorExpression
  | NewPlaceholderLocatorExpression
  | NewTitleLocatorExpression
  | NewAltTextLocatorExpression
  | NewCssLocatorExpression
  | NewTestIdLocatorExpression
  | GotoExpression
  | ReloadExpression
  | ClickExpression
  | ClickOptionsExpression
  | FillTextExpression
  | CheckExpression
  | SelectOptionsExpression
  | ExpectExpression
  | WaitForNavigationExpression
  | PromiseAllExpression

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
