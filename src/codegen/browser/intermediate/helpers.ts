import * as model from '../types'

import * as ir from './ast'

export class ExpressionBuilder {
  readonly node: model.TestNode

  private constructor(node: model.TestNode) {
    this.node = node
  }

  static for(node: model.TestNode): ExpressionBuilder {
    return new ExpressionBuilder(node)
  }

  identifier(name: string): ir.Identifier {
    return { type: 'Identifier', name }
  }

  string(value: string): ir.StringLiteral {
    return { type: 'StringLiteral', value }
  }

  nullLiteral(): ir.NullLiteral {
    return { type: 'NullLiteral' }
  }

  newPage(): ir.NewPageExpression {
    return { type: 'NewPageExpression' }
  }

  closePage(target: ir.Expression): ir.ClosePageExpression {
    return { type: 'ClosePageExpression', target }
  }

  newCssLocator(
    selector: ir.Expression,
    page: ir.Expression
  ): ir.NewCssLocatorExpression {
    return { type: 'NewCssLocatorExpression', selector, page }
  }

  newTestIdLocator(
    testId: ir.Expression,
    page: ir.Expression
  ): ir.NewTestIdLocatorExpression {
    return { type: 'NewTestIdLocatorExpression', testId, page }
  }

  newAltTextLocator(
    text: ir.Expression,
    page: ir.Expression,
    options: ir.Expression | null = null
  ): ir.NewAltTextLocatorExpression {
    return { type: 'NewAltTextLocatorExpression', text, page, options }
  }

  newLabelLocator(
    text: ir.Expression,
    page: ir.Expression,
    options: ir.Expression | null = null
  ): ir.NewLabelLocatorExpression {
    return { type: 'NewLabelLocatorExpression', text, page, options }
  }

  newPlaceholderLocator(
    text: ir.Expression,
    page: ir.Expression,
    options: ir.Expression | null = null
  ): ir.NewPlaceholderLocatorExpression {
    return { type: 'NewPlaceholderLocatorExpression', text, page, options }
  }

  newTitleLocator(
    text: ir.Expression,
    page: ir.Expression,
    options: ir.Expression | null = null
  ): ir.NewTitleLocatorExpression {
    return { type: 'NewTitleLocatorExpression', text, page, options }
  }

  newRoleLocator(
    role: ir.Expression,
    page: ir.Expression,
    options: ir.Expression | null = null
  ): ir.NewRoleLocatorExpression {
    return { type: 'NewRoleLocatorExpression', role, page, options }
  }

  textLocatorOptions(options: {
    exact?: boolean
  }): ir.TextLocatorOptionsExpression {
    return { type: 'TextLocatorOptionsExpression', exact: options.exact }
  }

  roleLocatorOptions(options: {
    name?: { value: string; exact?: boolean }
  }): ir.RoleLocatorOptionsExpression {
    return { type: 'RoleLocatorOptionsExpression', name: options.name }
  }

  goto(target: ir.Expression, url: ir.Expression | string): ir.GotoExpression {
    return {
      type: 'GotoExpression',
      target,
      url: typeof url === 'string' ? this.string(url) : url,
    }
  }

  reload(target: ir.Expression): ir.ReloadExpression {
    return { type: 'ReloadExpression', target }
  }

  clickOptions(
    button: ir.ClickOptionsExpression['button'],
    modifiers: ir.ClickOptionsExpression['modifiers']
  ): ir.ClickOptionsExpression {
    return { type: 'ClickOptionsExpression', button, modifiers }
  }

  click(
    locator: ir.Expression,
    options: ir.Expression | null = null
  ): ir.ClickExpression {
    return { type: 'ClickExpression', locator, options }
  }

  fillText(
    target: ir.Expression,
    value: ir.Expression | string
  ): ir.FillTextExpression {
    return {
      type: 'FillTextExpression',
      target,
      value: typeof value === 'string' ? this.string(value) : value,
    }
  }

  clear(locator: ir.Expression): ir.ClearExpression {
    return { type: 'ClearExpression', locator }
  }

  check(locator: ir.Expression, checked: boolean): ir.CheckExpression {
    return { type: 'CheckExpression', locator, checked }
  }

  selectOptionValue(value: {
    value?: string
    label?: string
    index?: number
  }): ir.SelectOptionValueExpression {
    return { type: 'SelectOptionValueExpression', ...value }
  }

  selectOptions(
    locator: ir.Expression,
    selected: ir.Expression[],
    multiple: boolean
  ): ir.SelectOptionsExpression {
    return { type: 'SelectOptionsExpression', locator, selected, multiple }
  }

  expect(actual: ir.Expression, expected: ir.Assertion): ir.ExpectExpression {
    return { type: 'ExpectExpression', actual, expected }
  }

  waitForOptions(options: {
    timeout?: number
    state?: ir.WaitForOptionsExpression['state']
  }): ir.WaitForOptionsExpression {
    return {
      type: 'WaitForOptionsExpression',
      timeout: options.timeout,
      state: options.state,
    }
  }

  waitFor(
    target: ir.Expression,
    options: ir.Expression | null = null
  ): ir.WaitForExpression {
    return { type: 'WaitForExpression', target, options }
  }

  waitForNavigation(target: ir.Expression): ir.WaitForNavigationExpression {
    return { type: 'WaitForNavigationExpression', target }
  }

  waitForTimeout(
    target: ir.Expression,
    timeout: number
  ): ir.WaitForTimeoutExpression {
    return { type: 'WaitForTimeoutExpression', target, timeout }
  }

  promiseAll(...expressions: ir.Expression[]): ir.PromiseAllExpression {
    return { type: 'PromiseAllExpression', expressions }
  }

  textContainsAssertion(text: ir.Expression): ir.TextContainsAssertion {
    return { type: 'TextContainsAssertion', text }
  }

  isVisibleAssertion(): ir.IsVisibleAssertion {
    return { type: 'IsVisibleAssertion' }
  }

  isHiddenAssertion(): ir.IsHiddenAssertion {
    return { type: 'IsHiddenAssertion' }
  }

  isAttributeEqualToAssertion(
    attribute: ir.Expression,
    value: ir.Expression
  ): ir.IsAttributeEqualToAssertion {
    return { type: 'IsAttributeEqualToAssertion', attribute, value }
  }

  isCheckedAssertion(): ir.IsCheckedAssertion {
    return { type: 'IsCheckedAssertion' }
  }

  isNotCheckedAssertion(): ir.IsNotCheckedAssertion {
    return { type: 'IsNotCheckedAssertion' }
  }

  isIndeterminateAssertion(): ir.IsIndeterminateAssertion {
    return { type: 'IsIndeterminateAssertion' }
  }

  hasValueAssertion(
    expected: [ir.Expression, ...ir.Expression[]]
  ): ir.HasValueAssertion {
    return { type: 'HasValueAssertion', expected }
  }
}
