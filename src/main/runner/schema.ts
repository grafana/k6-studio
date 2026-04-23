import { EventType, type eventWithTime } from '@rrweb/types'
import { z } from 'zod'

/**
 * Creates a fault-tolerant schema that returns `undefined` on failure. This is used
 * to guard against the user passing invalid options that would otherwise cause the entire
 * schema to fail.
 */
function safe<T>(schema: z.ZodType<T>) {
  return schema.optional().catch(undefined)
}

// Generic options schema to allow any options object. Should be refined later.
const GenericOptions = z.unknown()

const CssLocatorSchema = z.object({
  type: z.literal('css'),
  selector: z.string(),
})

const GetByRoleLocatorSchema = z.object({
  type: z.literal('role'),
  role: z.string(),
  options: z
    .object({
      name: z.string().optional(),
      exact: z.boolean().optional(),
    })
    .optional(),
})

const GetByTestIdLocatorSchema = z.object({
  type: z.literal('testid'),
  testId: z.string(),
})

const TextLocatorOptions = z
  .object({
    exact: z.boolean().optional(),
  })
  .optional()

const GetByAltTextLocatorSchema = z.object({
  type: z.literal('alt'),
  text: z.string(),
  options: TextLocatorOptions,
})

const GetByLabelLocatorSchema = z.object({
  type: z.literal('label'),
  label: z.string(),
  options: TextLocatorOptions,
})

const GetByPlaceholderLocatorSchema = z.object({
  type: z.literal('placeholder'),
  placeholder: z.string(),
  options: TextLocatorOptions,
})

const GetByTitleLocatorSchema = z.object({
  type: z.literal('title'),
  title: z.string(),
  options: TextLocatorOptions,
})

const GetByTextLocatorSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  options: TextLocatorOptions,
})

const ActionLocatorSchema = z.discriminatedUnion('type', [
  CssLocatorSchema,
  GetByRoleLocatorSchema,
  GetByTestIdLocatorSchema,
  GetByAltTextLocatorSchema,
  GetByLabelLocatorSchema,
  GetByPlaceholderLocatorSchema,
  GetByTitleLocatorSchema,
  GetByTextLocatorSchema,
])

const PageGotoActionSchema = z.object({
  method: z.literal('page.goto'),
  url: z.string(),
  options: GenericOptions.optional(),
})

const PageReloadActionSchema = z.object({
  method: z.literal('page.reload'),
  options: GenericOptions.optional(),
})

const PageWaitForNavigationActionSchema = z.object({
  method: z.literal('page.waitForNavigation'),
  options: GenericOptions.optional(),
})

const PageWaitForTimeoutActionSchema = z.object({
  method: z.literal('page.waitForTimeout'),
  // NaN is converted to null by `JSON.stringify` so we type this
  // as nullable and transform it back to NaN to allow invalid data
  // to be saved.
  timeout: z
    .number()
    .nullable()
    .transform((value) => value ?? NaN),
})

const PageCloseActionSchema = z.object({
  method: z.literal('page.close'),
})

const GenericPageActionSchema = z.object({
  method: z.literal('page.*'),
  name: z.string(),
  args: z.array(z.unknown()),
})

const LocatorClickOptionSchema = z
  .object({
    button: safe(
      z.union([z.literal('left'), z.literal('middle'), z.literal('right')])
    ),
    modifiers: safe(
      z.array(
        z.union([
          z.literal('Alt'),
          z.literal('Control'),
          z.literal('Meta'),
          z.literal('Shift'),
        ])
      )
    ),
  })
  .passthrough()

const LocatorClickActionSchema = z.object({
  method: z.literal('locator.click'),
  locator: ActionLocatorSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorDoubleClickActionSchema = z.object({
  method: z.literal('locator.dblclick'),
  locator: ActionLocatorSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorFillActionSchema = z.object({
  method: z.literal('locator.fill'),
  locator: ActionLocatorSchema,
  value: z.string(),
  options: GenericOptions.optional(),
})

const LocatorCheckActionSchema = z.object({
  method: z.literal('locator.check'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorUncheckActionSchema = z.object({
  method: z.literal('locator.uncheck'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSelectOptionActionSchema = z.object({
  method: z.literal('locator.selectOption'),
  locator: ActionLocatorSchema,
  values: z.array(
    z.object({
      value: z.string().optional(),
      label: z.string().optional(),
      index: z.number().optional(),
    })
  ),
  options: GenericOptions.optional(),
})

const LocatorWaitForActionSchema = z.object({
  method: z.literal('locator.waitFor'),
  locator: ActionLocatorSchema,
  options: z
    .object({
      state: z
        .union([
          z.literal('attached'),
          z.literal('detached'),
          z.literal('visible'),
          z.literal('hidden'),
        ])
        .optional(),
      timeout: z.number().optional(),
    })
    .optional(),
})

const LocatorHoverActionSchema = z.object({
  method: z.literal('locator.hover'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSetCheckedActionSchema = z.object({
  method: z.literal('locator.setChecked'),
  locator: ActionLocatorSchema,
  checked: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorTypeActionSchema = z.object({
  method: z.literal('locator.type'),
  locator: ActionLocatorSchema,
  text: z.string(),
  options: GenericOptions.optional(),
})

const LocatorPressActionSchema = z.object({
  method: z.literal('locator.press'),
  locator: ActionLocatorSchema,
  key: z.string(),
  options: GenericOptions.optional(),
})

const LocatorClearActionSchema = z.object({
  method: z.literal('locator.clear'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorTapActionSchema = z.object({
  method: z.literal('locator.tap'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorFocusActionSchema = z.object({
  method: z.literal('locator.focus'),
  locator: ActionLocatorSchema,
  options: GenericOptions.optional(),
})

const GenericLocatorActionSchema = z.object({
  method: z.literal('locator.*'),
  name: z.string(),
  locator: ActionLocatorSchema,
  args: z.array(z.unknown()),
})

const GenericBrowserContextActionSchema = z.object({
  method: z.literal('browserContext.*'),
  name: z.string(),
  args: z.array(z.unknown()),
})

export const AnyBrowserActionSchema = z.discriminatedUnion('method', [
  // BrowserContext actions
  GenericBrowserContextActionSchema,

  // Page actions
  PageGotoActionSchema,
  PageReloadActionSchema,
  PageWaitForNavigationActionSchema,
  PageWaitForTimeoutActionSchema,
  PageCloseActionSchema,
  GenericPageActionSchema,

  // Locator actions
  LocatorCheckActionSchema,
  LocatorClearActionSchema,
  LocatorClickActionSchema,
  LocatorDoubleClickActionSchema,
  LocatorFillActionSchema,
  LocatorFocusActionSchema,
  LocatorHoverActionSchema,
  LocatorPressActionSchema,
  LocatorSelectOptionActionSchema,
  LocatorSetCheckedActionSchema,
  LocatorTapActionSchema,
  LocatorTypeActionSchema,
  LocatorUncheckActionSchema,
  LocatorWaitForActionSchema,
  GenericLocatorActionSchema,
])

const ActionEventSchemaBase = z.object({
  eventId: z.string(),
  action: AnyBrowserActionSchema,
})

export const ActionBeginEventSchema = ActionEventSchemaBase.extend({
  type: z.literal('begin'),
  timestamp: z.object({
    started: z.number(),
    ended: z.undefined().optional(),
  }),
  result: z.undefined().optional(),
})

export const ActionSuccessSchema = z.object({
  type: z.literal('success'),
  returnValue: z.unknown().optional(),
})

export const ActionErrorSchema = z.object({
  type: z.literal('error'),
  error: z.string(),
})

export const ActionAbortedSchema = z.object({
  type: z.literal('aborted'),
})

export const ActionResult = z.discriminatedUnion('type', [
  ActionSuccessSchema,
  ActionErrorSchema,
  ActionAbortedSchema,
])

export const ActionEndEventSchema = ActionEventSchemaBase.extend({
  type: z.literal('end'),
  timestamp: z.object({
    started: z.number(),
    ended: z.number(),
  }),
  result: ActionResult,
})

export const SessionReplayEventSchema = z.object({
  events: z.array(
    // Check the basic structure of events, but don't bother parsing them fully. We
    // assume that rrweb will send well-formed events.
    z
      .object({
        type: z.nativeEnum(EventType),
        timestamp: z.number(),
      })
      .passthrough()
      .transform((ev) => ev as BrowserReplayEvent)
  ),
})

export const BrowserActionEventSchema = z.discriminatedUnion('type', [
  ActionBeginEventSchema,
  ActionEndEventSchema,
])

export type ActionLocator = z.infer<typeof ActionLocatorSchema>

export type ActionBeginEvent = z.infer<typeof ActionBeginEventSchema>
export type ActionEndEvent = z.infer<typeof ActionEndEventSchema>

export type BrowserActionEvent = z.infer<typeof BrowserActionEventSchema>
export type BrowserReplayEvent = eventWithTime

export type ActionResult = z.infer<typeof ActionResult>

export type PageGotoAction = z.infer<typeof PageGotoActionSchema>
export type PageReloadAction = z.infer<typeof PageReloadActionSchema>
export type PageWaitForNavigationAction = z.infer<
  typeof PageWaitForNavigationActionSchema
>
export type PageWaitForTimeoutAction = z.infer<
  typeof PageWaitForTimeoutActionSchema
>
export type GenericPageAction = z.infer<typeof GenericPageActionSchema>

export type LocatorCheckAction = z.infer<typeof LocatorCheckActionSchema>
export type LocatorClearAction = z.infer<typeof LocatorClearActionSchema>
export type LocatorClickAction = z.infer<typeof LocatorClickActionSchema>
export type LocatorDoubleClickAction = z.infer<
  typeof LocatorDoubleClickActionSchema
>
export type LocatorFillAction = z.infer<typeof LocatorFillActionSchema>
export type LocatorFocusAction = z.infer<typeof LocatorFocusActionSchema>
export type LocatorHoverAction = z.infer<typeof LocatorHoverActionSchema>
export type LocatorPressAction = z.infer<typeof LocatorPressActionSchema>
export type LocatorSelectOptionAction = z.infer<
  typeof LocatorSelectOptionActionSchema
>
export type LocatorSetCheckedAction = z.infer<
  typeof LocatorSetCheckedActionSchema
>
export type LocatorTapAction = z.infer<typeof LocatorTapActionSchema>
export type LocatorTypeAction = z.infer<typeof LocatorTypeActionSchema>
export type LocatorUncheckAction = z.infer<typeof LocatorUncheckActionSchema>
export type LocatorWaitForAction = z.infer<typeof LocatorWaitForActionSchema>

export type GenericLocatorAction = z.infer<typeof GenericLocatorActionSchema>

export type GenericBrowserContextAction = z.infer<
  typeof GenericBrowserContextActionSchema
>

export type AnyBrowserAction = z.infer<typeof AnyBrowserActionSchema>

// =============================================================================
// Assertion Schemas
// =============================================================================

const RetryConfigSchema = z.object({
  timeout: z.number().optional(),
  interval: z.number().optional(),
})

const TextMatchOptionsSchema = RetryConfigSchema.extend({
  ignoreCase: z.boolean().optional(),
  useInnerText: z.boolean().optional(),
})

function optionalArg<T extends z.ZodTypeAny>(schema: T) {
  return z.union([z.tuple([]), z.tuple([schema])])
}

// Locator assertions
const ExpectToBeCheckedSchema = z.object({
  method: z.literal('expect.toBeChecked'),
  negated: z.boolean(),
  args: optionalArg(RetryConfigSchema.partial()),
})

const ExpectToBeDisabledSchema = z.object({
  method: z.literal('expect.toBeDisabled'),
  negated: z.boolean(),
  args: optionalArg(RetryConfigSchema.partial()),
})

const ExpectToBeEditableSchema = z.object({
  method: z.literal('expect.toBeEditable'),
  negated: z.boolean(),
  args: optionalArg(RetryConfigSchema.partial()),
})

const ExpectToBeEmptySchema = z.object({
  method: z.literal('expect.toBeEmpty'),
  negated: z.boolean(),
  args: optionalArg(RetryConfigSchema.partial()),
})

const ExpectToBeEnabledSchema = z.object({
  method: z.literal('expect.toBeEnabled'),
  negated: z.boolean(),
  args: optionalArg(RetryConfigSchema.partial()),
})

const ExpectToBeHiddenSchema = z.object({
  method: z.literal('expect.toBeHidden'),
  negated: z.boolean(),
  args: optionalArg(RetryConfigSchema.partial()),
})

const ExpectToBeVisibleSchema = z.object({
  method: z.literal('expect.toBeVisible'),
  negated: z.boolean(),
  args: optionalArg(RetryConfigSchema.partial()),
})

const ExpectToHaveAttributeSchema = z.object({
  method: z.literal('expect.toHaveAttribute'),
  negated: z.boolean(),
  args: z.union([z.tuple([z.string()]), z.tuple([z.string(), z.string()])]),
})

const ExpectToHaveTextSchema = z.object({
  method: z.literal('expect.toHaveText'),
  negated: z.boolean(),
  // RegExp | string — RegExp does not survive JSON serialization
  args: z.union([
    z.tuple([z.unknown()]),
    z.tuple([z.unknown(), TextMatchOptionsSchema.partial()]),
  ]),
})

const ExpectToContainTextSchema = z.object({
  method: z.literal('expect.toContainText'),
  negated: z.boolean(),
  args: z.union([
    z.tuple([z.unknown()]),
    z.tuple([z.unknown(), TextMatchOptionsSchema.partial()]),
  ]),
})

const ExpectToHaveTitleSchema = z.object({
  method: z.literal('expect.toHaveTitle'),
  negated: z.boolean(),
  args: z.union([
    z.tuple([z.unknown()]),
    z.tuple([z.unknown(), RetryConfigSchema.partial()]),
  ]),
})

const ExpectToHaveValueSchema = z.object({
  method: z.literal('expect.toHaveValue'),
  negated: z.boolean(),
  args: z.union([
    z.tuple([z.string()]),
    z.tuple([z.string(), RetryConfigSchema.partial()]),
  ]),
})

// Generic value assertions
const ExpectToBeSchema = z.object({
  method: z.literal('expect.toBe'),
  negated: z.boolean(),
  args: z.tuple([z.unknown()]),
})

const ExpectToBeCloseToSchema = z.object({
  method: z.literal('expect.toBeCloseTo'),
  negated: z.boolean(),
  args: z.union([z.tuple([z.number()]), z.tuple([z.number(), z.number()])]),
})

const ExpectToBeGreaterThanSchema = z.object({
  method: z.literal('expect.toBeGreaterThan'),
  negated: z.boolean(),
  args: z.tuple([z.union([z.number(), z.bigint()])]),
})

const ExpectToBeGreaterThanOrEqualSchema = z.object({
  method: z.literal('expect.toBeGreaterThanOrEqual'),
  negated: z.boolean(),
  args: z.tuple([z.union([z.number(), z.bigint()])]),
})

const ExpectToBeLessThanSchema = z.object({
  method: z.literal('expect.toBeLessThan'),
  negated: z.boolean(),
  args: z.tuple([z.union([z.number(), z.bigint()])]),
})

const ExpectToBeLessThanOrEqualSchema = z.object({
  method: z.literal('expect.toBeLessThanOrEqual'),
  negated: z.boolean(),
  args: z.tuple([z.union([z.number(), z.bigint()])]),
})

const ExpectToBeDefinedSchema = z.object({
  method: z.literal('expect.toBeDefined'),
  negated: z.boolean(),
  args: z.tuple([]),
})

const ExpectToBeFalsySchema = z.object({
  method: z.literal('expect.toBeFalsy'),
  negated: z.boolean(),
  args: z.tuple([]),
})

const ExpectToBeInstanceOfSchema = z.object({
  method: z.literal('expect.toBeInstanceOf'),
  negated: z.boolean(),
  // Function does not survive JSON serialization
  args: z.tuple([z.unknown()]),
})

const ExpectToBeNaNSchema = z.object({
  method: z.literal('expect.toBeNaN'),
  negated: z.boolean(),
  args: z.tuple([]),
})

const ExpectToBeNullSchema = z.object({
  method: z.literal('expect.toBeNull'),
  negated: z.boolean(),
  args: z.tuple([]),
})

const ExpectToBeTruthySchema = z.object({
  method: z.literal('expect.toBeTruthy'),
  negated: z.boolean(),
  args: z.tuple([]),
})

const ExpectToBeUndefinedSchema = z.object({
  method: z.literal('expect.toBeUndefined'),
  negated: z.boolean(),
  args: z.tuple([]),
})

const ExpectToEqualSchema = z.object({
  method: z.literal('expect.toEqual'),
  negated: z.boolean(),
  args: z.tuple([z.unknown()]),
})

const ExpectToContainSchema = z.object({
  method: z.literal('expect.toContain'),
  negated: z.boolean(),
  args: z.tuple([z.unknown()]),
})

const ExpectToContainEqualSchema = z.object({
  method: z.literal('expect.toContainEqual'),
  negated: z.boolean(),
  args: z.tuple([z.unknown()]),
})

const ExpectToHaveLengthSchema = z.object({
  method: z.literal('expect.toHaveLength'),
  negated: z.boolean(),
  args: z.tuple([z.number()]),
})

const ExpectToHavePropertySchema = z.object({
  method: z.literal('expect.toHaveProperty'),
  negated: z.boolean(),
  args: z.union([z.tuple([z.string()]), z.tuple([z.string(), z.unknown()])]),
})

const GenericAssertionSchema = z.object({
  method: z.literal('expect.*'),
  name: z.string(),
  negated: z.boolean(),
  args: z.array(z.unknown()),
})

export const AnyAssertionSchema = z.discriminatedUnion('method', [
  ExpectToBeCheckedSchema,
  ExpectToBeDisabledSchema,
  ExpectToBeEditableSchema,
  ExpectToBeEmptySchema,
  ExpectToBeEnabledSchema,
  ExpectToBeHiddenSchema,
  ExpectToBeVisibleSchema,
  ExpectToHaveAttributeSchema,
  ExpectToHaveTextSchema,
  ExpectToContainTextSchema,
  ExpectToHaveTitleSchema,
  ExpectToHaveValueSchema,
  ExpectToBeSchema,
  ExpectToBeCloseToSchema,
  ExpectToBeGreaterThanSchema,
  ExpectToBeGreaterThanOrEqualSchema,
  ExpectToBeLessThanSchema,
  ExpectToBeLessThanOrEqualSchema,
  ExpectToBeDefinedSchema,
  ExpectToBeFalsySchema,
  ExpectToBeInstanceOfSchema,
  ExpectToBeNaNSchema,
  ExpectToBeNullSchema,
  ExpectToBeTruthySchema,
  ExpectToBeUndefinedSchema,
  ExpectToEqualSchema,
  ExpectToContainSchema,
  ExpectToContainEqualSchema,
  ExpectToHaveLengthSchema,
  ExpectToHavePropertySchema,
  GenericAssertionSchema,
])

// =============================================================================
// Assertion Error Schemas
// =============================================================================

const RelationalOperatorSchema = z.union([
  z.literal('>'),
  z.literal('>='),
  z.literal('<'),
  z.literal('<='),
])

const ExpectedReceivedErrorSchema = z.object({
  format: z.literal('expected-received'),
  expected: z.unknown(),
  received: z.unknown(),
  message: z.string().optional(),
})

const RelationalComparisonErrorSchema = z.object({
  format: z.literal('relational-comparison'),
  expected: z.union([z.number(), z.bigint()]),
  received: z.union([z.number(), z.bigint()]),
  operator: RelationalOperatorSchema,
  message: z.string().optional(),
})

const TextMatchErrorSchema = z.object({
  format: z.literal('text-match'),
  // RegExp does not survive JSON serialization
  expected: z.unknown(),
  received: z.string(),
  message: z.string().optional(),
})

const TypeMismatchErrorSchema = z.object({
  format: z.literal('type-mismatch'),
  expected: z.array(z.unknown()),
  received: z.unknown(),
  message: z.string().optional(),
})

const CustomErrorSchema = z.object({
  format: z.literal('custom'),
  content: z.unknown(),
  message: z.string().optional(),
})

const ReceivedOnlyErrorSchema = z.object({
  format: z.literal('received'),
  received: z.unknown(),
  message: z.string().optional(),
})

interface TraceError {
  format: 'trace'
  // AnyError is recursive; inner is left untyped to avoid a circular reference
  inner: AssertionError
  trace: string[]
  message?: string
}

const TraceErrorSchema = z.object({
  format: z.literal('trace'),
  // AnyError is recursive; inner is left untyped to avoid a circular reference
  inner: z.lazy(() => AssertionErrorSchema),
  trace: z.array(z.string()),
  message: z.string().optional(),
}) satisfies z.ZodType<TraceError>

// Fallback that accepts any error format not matched above
const UnknownAssertionErrorSchema = z
  .object({
    format: z.string(),
    message: z.string().optional(),
  })
  .passthrough()

export const AssertionErrorSchema: z.ZodType<AssertionError> = z.union([
  ExpectedReceivedErrorSchema,
  RelationalComparisonErrorSchema,
  TextMatchErrorSchema,
  TypeMismatchErrorSchema,
  CustomErrorSchema,
  ReceivedOnlyErrorSchema,
  TraceErrorSchema,
  UnknownAssertionErrorSchema,
]) satisfies z.ZodType<AssertionError>

type AssertionError =
  | z.infer<typeof ExpectedReceivedErrorSchema>
  | z.infer<typeof RelationalComparisonErrorSchema>
  | z.infer<typeof TextMatchErrorSchema>
  | z.infer<typeof TypeMismatchErrorSchema>
  | z.infer<typeof CustomErrorSchema>
  | z.infer<typeof ReceivedOnlyErrorSchema>
  | z.infer<typeof UnknownAssertionErrorSchema>
  | TraceError

// =============================================================================
// Assertion Result + Event Schemas
// =============================================================================

const AssertionPassResultSchema = z.object({
  type: z.literal('pass'),
})

const AssertionFailResultSchema = z.object({
  type: z.literal('fail'),
  error: AssertionErrorSchema,
})

export const AssertionResultSchema = z.discriminatedUnion('type', [
  AssertionPassResultSchema,
  AssertionFailResultSchema,
])

const AssertionEventBaseSchema = z.object({
  eventId: z.string(),
  assertion: AnyAssertionSchema,
})

export const AssertionBeginEventSchema = AssertionEventBaseSchema.extend({
  type: z.literal('begin'),
  timestamp: z.object({
    started: z.number(),
    ended: z.undefined().optional(),
  }),
  result: z.undefined().optional(),
})

export const AssertionEndEventSchema = AssertionEventBaseSchema.extend({
  type: z.literal('end'),
  timestamp: z.object({
    started: z.number(),
    ended: z.number(),
  }),
  result: AssertionResultSchema,
})

export const BrowserAssertionEventSchema = z.discriminatedUnion('type', [
  AssertionBeginEventSchema,
  AssertionEndEventSchema,
])

export type AnyAssertion = z.infer<typeof AnyAssertionSchema>
export type AssertionResult = z.infer<typeof AssertionResultSchema>
export type AssertionBeginEvent = z.infer<typeof AssertionBeginEventSchema>
export type AssertionEndEvent = z.infer<typeof AssertionEndEventSchema>
export type BrowserAssertionEvent = z.infer<typeof BrowserAssertionEventSchema>
