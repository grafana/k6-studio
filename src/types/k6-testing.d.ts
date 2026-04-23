/* eslint-disable */
declare module 'https://jslib.k6.io/k6-testing/*/index.js' {
  /**
   * SoftMode defines how soft assertions should be handled when they fail.
   *
   * - 'throw': The assertion will throw an AssertionFailedError, which will fail the iteration but continue the test.
   * - 'fail': The assertion will mark the test as failed using exec.test.fail, but will continue execution.
   */
  export type SoftMode = 'throw' | 'fail'
  declare function assert(
    condition: boolean,
    message: string,
    soft?: boolean,
    softMode?: SoftMode
  ): void
  export interface ErrorFormats {
    'expected-received': {
      expected: unknown
      received: unknown
    }
  }
  /**
   * Relational operators used in comparison matchers (e.g. toBeGreaterThan, toBeLessThan).
   */
  export type RelationalOperator = '>' | '>=' | '<' | '<='
  export interface ErrorFormats {
    'relational-comparison': {
      expected: number | bigint
      received: number | bigint
      operator: RelationalOperator
    }
  }
  export interface ErrorFormats {
    'text-match': {
      expected: string | RegExp
      received: string
    }
  }
  export type PrimitiveType =
    | {
        name: string
      }
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'array'
    | 'function'
    | 'null'
  export interface ErrorFormats {
    'type-mismatch': {
      expected: PrimitiveType[]
      received: unknown
    }
  }
  export interface ErrorFormats {
    custom: {
      content: FormattedMessage
    }
  }
  export interface ErrorFormats {
    received: {
      received: unknown
    }
  }
  export interface ErrorFormats {
    trace: {
      inner: AnyError
      trace: string[]
    }
  }
  export interface Matchers<Received> {
    /**
     * Ensures that the Locator points to a checked input.
     */
    toBeChecked: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures the Locator points to a disabled element.
     * Element is disabled if it has "disabled" attribute or is disabled via 'aria-disabled'.
     *
     * Note that only native control elements such as HTML button, input, select, textarea, option, optgroup can be disabled by setting "disabled" attribute.
     * "disabled" attribute on other elements is ignored by the browser.
     */
    toBeDisabled: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures the Locator points to an editable element.
     */
    toBeEditable: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures the Locator points to an empty element. If the element is an input,
     * it will be empty if it has no value. If the element is not an input, it will
     * be empty if it has no text content.
     */
    toBeEmpty: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures the Locator points to an enabled element.
     */
    toBeEnabled: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures that Locator either does not resolve to any DOM node, or resolves to a non-visible one.
     */
    toBeHidden: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures that Locator points to an attached and visible DOM node.
     */
    toBeVisible: Received extends Locator
      ? (options?: Partial<RetryConfig>) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures that the Locator points to an element that has the given attribute and, optionally, the given value.
     */
    toHaveAttribute: Received extends Locator
      ? (attribute: string, expectedValue?: string) => Promise<void>
      : never
  }
  export interface ToHaveTextOptions extends RetryConfig {
    /**
     * If true, comparison will be case-insensitive. If defined, this option will override the `i` flag of
     * regular expressions. Defaults to `undefined`.
     */
    ignoreCase?: boolean
    /**
     * If true, the text will be compared using `innerText()` instead of `textContent()`. Defaults to `false`.
     */
    useInnerText?: boolean
  }
  export interface Matchers<Received> {
    /**
     * Ensures that the Locator points to an element with the given text.
     * If the type of `expected` is a string, both the expected and actual text will have any zero-width
     * characters removed and whitespace collapsed to a single space. If the type of `expected`
     * is a regular expression, the content of the element will be matched against the regular expression as-is.
     */
    toHaveText: Received extends Locator
      ? (
          expected: RegExp | string,
          options?: Partial<ToHaveTextOptions>
        ) => Promise<void>
      : never
  }
  export interface ToContainTextOptions extends RetryConfig {
    /**
     * If true, comparison will be case-insensitive. If defined, this option will override the `i` flag of
     * regular expressions. Defaults to `undefined`.
     */
    ignoreCase?: boolean
    /**
     * If true, the text will be compared using `innerText()` instead of `textContent()`. Defaults to `false`.
     */
    useInnerText?: boolean
  }
  export interface Matchers<Received> {
    /**
     * Ensures that the Locator points to an element that contains the given text.
     * If the type of `expected` is a string, both the expected and actual text will have any zero-width
     * characters removed and whitespace collapsed to a single space. If the type of `expected`
     * is a regular expression, the content of the element will be matched against the regular expression as-is.
     */
    toContainText: Received extends Locator
      ? (
          expected: RegExp | string,
          options?: Partial<ToContainTextOptions>
        ) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures that the Page's title matches the given title.
     */
    toHaveTitle: Received extends Page
      ? (
          expected: RegExp | string,
          options?: Partial<RetryConfig>
        ) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures the Locator points to an element with the given input value.
     */
    toHaveValue: Received extends Locator
      ? (value: string, options?: Partial<RetryConfig>) => Promise<void>
      : never
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is equal to the expected value.
     *
     * @param expected the expected value
     */
    toBe(expected: unknown): void
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is close to the expected value with a given precision.
     *
     * @param expected the expected value
     * @param precision the number of decimal places to consider
     */
    toBeCloseTo(expected: number, precision?: number): void
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is greater than the expected value.
     *
     * @param expected the expected value
     */
    toBeGreaterThan: Received extends number | bigint
      ? (expected: number | bigint) => void
      : never
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is greater than or equal to the expected value.
     *
     * @param expected the expected value
     */
    toBeGreaterThanOrEqual: Received extends number | bigint
      ? (expected: number | bigint) => void
      : never
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is less than the expected value.
     *
     * @param expected the expected value
     */
    toBeLessThan: Received extends number | bigint
      ? (expected: number | bigint) => void
      : never
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is less than or equal to the expected value.
     *
     * @param expected the expected value
     */
    toBeLessThanOrEqual: Received extends number | bigint
      ? (expected: number | bigint) => void
      : never
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is not `undefined`.
     */
    toBeDefined(): void
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is truthy.
     */
    toBeFalsy(): void
  }
  export interface Matchers<Received> {
    /**
     * Ensures that value is an instance of a class. Uses instanceof operator.
     *
     * @param expected The class or constructor function.
     */
    toBeInstanceOf(expected: Function): void
  }
  export interface Matchers<Received> {
    /**
     * Ensures that value is NaN.
     */
    toBeNaN(): void
  }
  export interface Matchers<Received> {
    /**
     * Ensures that value is null.
     */
    toBeNull(): void
  }
  export interface Matchers<Received> {
    /**
     * Ensures that value is true in a boolean context, anything but false, 0, '', null, undefined or NaN.
     * Use this method when you don't care about the specific value.
     */
    toBeTruthy(): void
  }
  export interface Matchers<Received> {
    /**
     * Ensures that value is `undefined`.
     */
    toBeUndefined(): void
  }
  export interface Matchers<Received> {
    /**
     * Asserts that the value is equal to the expected value.
     *
     * @param expected the expected value
     */
    toEqual(expected: unknown): void
  }
  export type CollectionLike = Array<unknown> | Set<unknown> | string
  export type ItemType<T extends CollectionLike> =
    T extends Array<infer U>
      ? U
      : T extends Set<infer U>
        ? U
        : T extends string
          ? string
          : never
  export interface Matchers<Received> {
    /**
     * Ensures that a string contains an expected substring using a case-sensitive comparison,
     * or that an Array or Set contains an expected item.
     *
     * @param expected The substring or item to check for
     */
    toContain: Received extends CollectionLike
      ? (expected: ItemType<Received>) => void
      : never
  }
  export type ArrayOrSet = Array<unknown> | Set<unknown>
  export interface Matchers<Received> {
    /**
     * Ensures that value is an Array or Set and contains an item equal to the expected.
     *
     * For objects, this method recursively checks equality of all fields, rather than comparing objects by reference.
     * For primitive values, this method is equivalent to expect(value).toContain().
     *
     * @param expected The item to check for deep equality within the collection
     */
    toContainEqual: Received extends ArrayOrSet
      ? (expected: unknown) => void
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures that value has a `.length` property equal to expected.
     * Useful for arrays and strings.
     *
     * @param expected
     */
    toHaveLength: Received extends {
      length: number
    }
      ? (expected: number) => void
      : never
  }
  export interface Matchers<Received> {
    /**
     * Ensures that property at provided `keyPath` exists on the object and optionally checks
     * that property is equal to the expected. Equality is checked recursively, similarly to expect(value).toEqual().
     *
     * @param keyPath Path to the property. Use dot notation a.b to check nested properties
     *                and indexed a[2] notation to check nested array items.
     * @param expected Optional expected value to compare the property to.
     */
    toHaveProperty(keyPath: string, expected?: unknown): void
  }
  /**
   * The `ErrorFormats` interface is an extension point for defining new error formats.
   *
   * To add a new error format, extend this interface using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
   * and then register the format using the `expect.registerFormatter` function.
   *
   * @example
   * ```ts
   * import { expect } from "k6/expect";
   *
   * declare module "k6/expect" {
   *   interface ErrorFormats {
   *     myCustomFormat: {
   *       actual: unknown;
   *       expected: unknown;
   *       customField: string;
   *     };
   *   }
   * }
   *
   * expect.registerFormatter("myCustomFormat", (error) => {
   *   // Format the error into a FormattedMessage
   * })
   */
  export interface ErrorFormats {}
  /**
   * A union type of all registered error formats.
   */
  export type AnyError = {
    [Format in keyof ErrorFormats]: ErrorFormats[Format] & {
      format: Format
      message?: string
    }
  }[keyof ErrorFormats]
  declare const ANSI_COLORS: {
    readonly reset: '\u001B[0m'
    readonly black: '\u001B[30m'
    readonly red: '\u001B[31m'
    readonly green: '\u001B[32m'
    readonly yellow: '\u001B[33m'
    readonly blue: '\u001B[34m'
    readonly magenta: '\u001B[35m'
    readonly cyan: '\u001B[36m'
    readonly white: '\u001B[37m'
    readonly brightBlack: '\u001B[90m'
    readonly brightRed: '\u001B[91m'
    readonly brightGreen: '\u001B[92m'
    readonly brightYellow: '\u001B[93m'
    readonly brightBlue: '\u001B[94m'
    readonly brightMagenta: '\u001B[95m'
    readonly brightCyan: '\u001B[96m'
    readonly brightWhite: '\u001B[97m'
    readonly darkGrey: '\u001B[90m'
  }
  export type AnsiColor = keyof typeof ANSI_COLORS
  export declare function colorize(
    text: string | undefined,
    color: AnsiColor
  ): string
  /**
   * A value that has a color applied to it.
   */
  export interface ColoredValue<T extends Value = Value> {
    value: T
    color: AnsiColor
  }
  /**
   * A value that can be rendered by the formatting system. It's a recursive
   * type that can be used to build formatted values with a complex structure,
   * such as nested colors.
   */
  export type Value = Value[] | ColoredValue | string
  /**
   * Represents a bulleted list of values, indented on a new line after
   * the property of the group it's assigned to.
   *
   * ```
   * Expected:
   *   - One
   *   - Two
   * ```
   */
  export type List = {
    items: Value[]
  }
  /**
   * A group is a key-value mapping that will be rendered close together:
   *
   * ```
   *   Expected: 42
   *   Received: 43
   * ```
   */
  export type Group = Record<
    string,
    List | Value | 0 | false | null | undefined
  >
  /**
   * A formatted message is a collection of groups that will be separated by
   * blank lines when printed. For convencience.
   *
   * ```
   *     Error: "hello"
   *        At: test.js:10:5
   *
   *  Expected: 42
   *  Received: 43
   *
   *  Filename: test.js
   *      Line: 10
   * ```
   */
  export type FormattedMessage = Group[] | Group
  export type MatcherFn = (...args: any[]) => Promise<void> | void
  /**
   * The `Matchers` interface is the extension point for adding new matchers.
   * Matchers can extend this interface using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
   * and then implement the matcher using the `expect.extend` function.
   *
   * The `Received` type parameter represents the type of value passed to the
   * `expect` function and can be used to filter available matchers.
   *
   * @example
   * ```ts
   * import { expect } from "k6/expect";
   *
   * declare module "k6/expect" {
   *   interface Matchers<Received> {
   *     // Adds a matcher that will be available for all received types
   *     toSay(message: string): void
   *
   *     // Adds a matcher that will only be available when the received value is a string
   *     toStartWith: Received extends string ? (prefix: string) => void : never;
   *   }
   * }
   *
   * expect.extend("toSay", {
   *   // ...matcher implementation...
   * })
   *
   * expect.extend("toStartWith", {
   *   // ...matcher implementation...
   * })
   * ```
   */
  export interface Matchers<Received> {}
  /**
   * Utility interface for extracting only function properties from the `Matchers` interface.
   */
  export type ValidMatchers<Received = any> = {
    [K in keyof Matchers<Received> as Matchers<Received>[K] extends never
      ? never
      : K]: Matchers<Received>[K] extends MatcherFn
      ? Matchers<Received>[K]
      : never
  }
  /**
   * Utility type for extracting the matchers that can handle the given `Received` type.
   */
  export type MatchersFor<Received> = {
    [K in keyof ValidMatchers<Received> as ValidMatchers<Received>[K] extends never
      ? never
      : K]: ValidMatchers<Received>[K]
  }
  export interface OnBeginContext {
    negated: boolean
    matcher: {
      name: string
      args: unknown[]
    }
    received: unknown
  }
  export interface OnEndContext {
    negated: boolean
    matcher: {
      name: string
      args: unknown[]
    }
    received: unknown
    result:
      | {
          passed: true
        }
      | {
          passed: false
          message: {
            custom?: string
          }
          error: AnyError
        }
  }
  export interface ExpectPlugin {
    name: string
    onBegin(context: OnBeginContext): void
    onEnd(context: OnEndContext): void
  }
  /**
   * The display format to use.
   *
   * "pretty" is the default format and outputs in a human readable format with aligned columns.
   * "inline" is a logfmt style format that outputs in a single line.
   */
  export type DisplayFormat = 'inline' | 'pretty'
  /**
   * The configuration for the renderer.
   */
  export interface RenderConfig {
    /**
     * Setting this option to false will disable the colorization of the output of the
     * expect function. The default is true.
     */
    colorize: boolean
    /**
     * Expectations can be displayed in two different ways: inline or pretty.
     * The default is pretty.
     *
     * When displayed inline, the expectation will be displayed in a single line, to
     * make it easier to interpret the output when written to logs.
     *
     * When displayed pretty, the expectation will be displayed in a more human-readable
     * format, with each part of the expectation in a separate line.
     */
    display: DisplayFormat
  }
  /**
   * The configuration for the retry behavior.
   */
  export interface RetryConfig {
    /**
     * Maximum amount of time to retry in milliseconds.
     * @default 5000
     */
    timeout?: number
    /**
     * Time between retries in milliseconds.
     * @default 100
     */
    interval?: number
  }
  /**
   * Options that can be set for the expect function.
   */
  export interface ExpectConfig extends RenderConfig, RetryConfig {
    /**
     * Setting this option to true will make the assertions performed by expect
     * to be always soft, meaning that they will not fail the test if the assertion
     * is not met.
     */
    soft: boolean
    /**
     * Controls how soft assertions behave when they fail.
     *
     * - 'throw': The assertion will throw an AssertionFailedError which will fail the iteration but continue the test.
     * - 'fail': The assertion will mark the test as failed using exec.test.fail but will continue execution.
     *
     * @default 'throw'
     */
    softMode: SoftMode
    /**
     * Optional custom assertion function to be used instead of the default assert function.
     *
     * This function should have the same signature as the assert function.
     */
    assertFn?: (...args: Parameters<typeof assert>) => void
    /**
     * Optional plugins with lifecycle hooks.
     */
    plugins?: ExpectPlugin[]
  }
  /**
   * The expect function is used to assert that a value meets certain conditions.
   *
   * The expect function can be used in two ways:
   *
   * 1. Non-retrying: The expect function will perform the assertion only once. If the assertion
   * is not met, the test will fail.
   * 2. Retrying: The expect function will perform the assertion multiple times, until the assertion
   * is met or the timeout is reached. If the assertion is not met, the test will fail.
   *
   * @param {unknown | Locator | Page} value The value to assert.
   */
  export declare const expect: ExpectFunction
  export interface ExpectFunction {
    /**
     * The expect function can be used directly to assert that a value meets certain conditions.
     *
     * If the value argument provided to it is a Locator or Page, the expect function will
     * return a (asynchronous) RetryingExpectation, otherwise it will return a NonRetryingExpectation.
     */
    <T>(value: T, message?: string): Expectations<T>
    /**
     * The soft function can be used to assert that a value meets certain conditions, but
     * without terminating the test if the assertion is not met.
     */
    soft<T>(value: T, message?: string): Expectations<T>
    /**
     * Creates a new expect instance with the given configuration.
     */
    configure(newConfig: Partial<ExpectConfig>): ExpectFunction
    /**
     * The configuration used by the expect function.
     */
    readonly config: ExpectConfig
    /**
     * Adds a plugin to the current expect function. This will mutate the expect function. Prefer
     * using the `configure` method to create a new expect function with the plugin added.
     */
    use(plugin: ExpectPlugin): void
  }
  export type Expectations<T> = MatchersFor<T> & {
    not: Expectations<T>
  }
  export interface TestRunContext {
    start: (test: TestCase) => void
    pass: (test: TestCase) => void
    fail: (test: TestCase, error: unknown) => void
  }
  export interface TestCase {
    type: 'test'
    name: string
    execute: (self: TestCase, context: TestRunContext) => Promise<void>
  }
  export interface TestCaseResultBase {
    meta: {
      path: string[]
      name: string
      duration: number
    }
  }
  export interface TestCasePassed extends TestCaseResultBase {
    type: 'pass'
  }
  export interface TestCaseFailed extends TestCaseResultBase {
    type: 'fail'
    error: unknown
  }
  export interface TestCaseSkipped extends TestCaseResultBase {
    type: 'skip'
  }
  export type TestCaseResult = TestCasePassed | TestCaseFailed | TestCaseSkipped
  export type Reporter = (result: TestCaseResult) => void
  export interface RunOptions {
    cwd?: string
    include?: ((testCase: TestCaseInstance) => boolean) | RegExp | string
    reporter?: Reporter
  }
  export interface TestCaseInstance {
    path: [string, ...string[]]
    test: TestCase
  }
  export declare class TestSuite {
    #private
    add(test: TestCase): void
    enterGroup(name: string, fn: () => void): void
    run({ cwd, include, reporter }?: RunOptions): Promise<TestCaseResult[]>
    clear(): void
  }
  export type DeepPartial<T> = T extends (...args: any[]) => any
    ? T
    : T extends object
      ? {
          [K in keyof T]?: DeepPartial<T[K]>
        }
      : T
  export interface ExtendOptions<Context, Options> {
    /**
     * Defaults for any additional options added to the new test function. These
     * should preferrably be namespaced to avoid collisions.
     *
     * @example
     * ```ts
     * {
     *  defaultOptions: {
     *    myExtension: {
     *      sayHello: true
     *    }
     *  }
     * }
     * ```
     */
    defaultOptions: Options
    /**
     * A function used to to merge new options into the base options. It should
     * return a complete options object and avoid touching options that it doesn't
     * own.
     *
     * @param baseOptions The base options to merge the new options into.
     * @param newOptions The new options to merge.
     * @returns The merged options.
     *
     * @example
     * ```ts
     * mergeOptions(baseOptions, newOptions) {
     *   return {
     *     ...baseOptions,
     *     myExtension: {
     *       ...baseOptions.myExtension,
     *       ...newOptions.myExtension,
     *     }
     *   }
     * }
     * ```
     */
    mergeOptions: (
      baseOptions: Options,
      newOptions: DeepPartial<Options>
    ) => Options
    /**
     * A function that will be called to create a new test context before every
     * test. The created context will be passed to the test function.
     *
     * @param options The default options merged with any options configured using `test.configure()`.
     * @returns The created context, optionally with a `dispose` method to clean up resources after the test.
     *
     * @example
     * ```ts
     * createContext(options) {
     *   const browserContext = browser.newContext();
     *   const page = browserContext.newPage();
     *
     *   return {
     *     context: {
     *       page
     *     },
     *     dispose: async (context) => {
     *       await page.close();
     *       await browserContext.close();
     *     }
     *   }
     * }
     * ```
     */
    createContext: (
      options: Options
    ) => Promise<Disposable<Context>> | Disposable<Context>
  }
  export interface TestFunction<Context, Options> {
    /**
     * Define a test case with the given name and function.
     *
     * @param name The name of the test case.
     * @param fn The test function, which receives the test context and options.
     */
    (
      name: string,
      fn: (
        context: Context & {
          options: Options
        }
      ) => Promise<void> | void
    ): void
    /**
     * Create a custom test function with additional context parameters. This can be
     * used to create more specialized functions that e.g. manages resources such as
     * database connections, browser instances, etc.
     *
     * @param options The options for extending the test function.
     * @returns New test functions that can access the additional context.
     */
    extend<NewContext, NewOptions>(
      options: ExtendOptions<NewContext, NewOptions>
    ): TestFunctions<Context & NewContext, Options & NewOptions>
    /**
     * Creates a new test function with the given options merged into the base options.
     *
     * @param newOptions The new options to merge into the base options.
     * @returns A new test function with the merged options.
     */
    configure(newOptions: DeepPartial<Options>): TestFunction<Context, Options>
  }
  export interface Disposable<Context> {
    context: Context
    dispose?: (context: Context) => Promise<void> | void
  }
  export interface TestFunctions<Context, Options> {
    test: TestFunction<Context, Options>
    it: TestFunction<Context, Options>
    describe: (name: string, fn: () => void) => void
  }
  export type ExpectOptions = Partial<
    Omit<ExpectConfig, 'assertFn' | 'plugins'>
  >
  export interface CreateTestSuiteOptions {
    /**
     * Configuration options for the `expect` function used in tests.
     */
    expect?: ExpectOptions
  }
  export type TestSuiteTestFunction = TestFunction<
    {
      expect: ExpectFunction
    },
    {
      expect?: ExpectOptions
    }
  >
  export interface CreateTestSuiteResult {
    suite: TestSuite
    test: TestSuiteTestFunction
    it: TestSuiteTestFunction
    describe: (name: string, callback: () => void) => void
  }
  /**
   * Creates a new test suite. The suite includes test functions (`test`, `it`, `describe`) that
   * can be used to define test cases and groups.
   *
   * @param options Configuration options for creating the test suite.
   * @returns A new test suite with associated test functions.
   */
  export declare function createTestSuite({
    expect: expectConfig,
  }?: CreateTestSuiteOptions): CreateTestSuiteResult

  export {}
}
