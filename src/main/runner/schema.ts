import { EventType, type eventWithTime } from '@rrweb/types'
import { z } from 'zod/v4'

import { ElementLocatorSchema } from '@/schemas/locator'

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

const PageGotoDebugEventSchema = z.object({
  method: z.literal('page.goto'),
  url: z.string(),
  options: GenericOptions.optional(),
})

const PageReloadDebugEventSchema = z.object({
  method: z.literal('page.reload'),
  options: GenericOptions.optional(),
})

const PageWaitForNavigationDebugEventSchema = z.object({
  method: z.literal('page.waitForNavigation'),
  options: GenericOptions.optional(),
})

const PageWaitForTimeoutDebugEventSchema = z.object({
  method: z.literal('page.waitForTimeout'),
  // NaN is converted to null by `JSON.stringify` so we type this
  // as nullable and transform it back to NaN to allow invalid data
  // to be saved.
  timeout: z
    .number()
    .nullable()
    .transform((value) => value ?? NaN),
})

const PageCloseDebugEventSchema = z.object({
  method: z.literal('page.close'),
})

const GenericPageDebugEventSchema = z.object({
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
    waitForNavigation: safe(z.boolean()),
  })
  .passthrough()

const LocatorClickDebugEventSchema = z.object({
  method: z.literal('locator.click'),
  locator: ElementLocatorSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorDoubleClickDebugEventSchema = z.object({
  method: z.literal('locator.dblclick'),
  locator: ElementLocatorSchema,
  options: LocatorClickOptionSchema.optional(),
})

const LocatorFillDebugEventSchema = z.object({
  method: z.literal('locator.fill'),
  locator: ElementLocatorSchema,
  value: z.string(),
  options: GenericOptions.optional(),
})

const LocatorCheckDebugEventSchema = z.object({
  method: z.literal('locator.check'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorUncheckDebugEventSchema = z.object({
  method: z.literal('locator.uncheck'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSelectOptionDebugEventSchema = z.object({
  method: z.literal('locator.selectOption'),
  locator: ElementLocatorSchema,
  values: z.array(
    z.object({
      value: z.string().optional(),
      label: z.string().optional(),
      index: z.number().optional(),
    })
  ),
  options: GenericOptions.optional(),
})

const LocatorWaitForDebugEventSchema = z.object({
  method: z.literal('locator.waitFor'),
  locator: ElementLocatorSchema,
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

const LocatorHoverDebugEventSchema = z.object({
  method: z.literal('locator.hover'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorSetCheckedDebugEventSchema = z.object({
  method: z.literal('locator.setChecked'),
  locator: ElementLocatorSchema,
  checked: z.boolean(),
  options: GenericOptions.optional(),
})

const LocatorTypeDebugEventSchema = z.object({
  method: z.literal('locator.type'),
  locator: ElementLocatorSchema,
  text: z.string(),
  options: GenericOptions.optional(),
})

const LocatorPressDebugEventSchema = z.object({
  method: z.literal('locator.press'),
  locator: ElementLocatorSchema,
  key: z.string(),
  options: GenericOptions.optional(),
})

const LocatorClearDebugEventSchema = z.object({
  method: z.literal('locator.clear'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorTapDebugEventSchema = z.object({
  method: z.literal('locator.tap'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const LocatorFocusDebugEventSchema = z.object({
  method: z.literal('locator.focus'),
  locator: ElementLocatorSchema,
  options: GenericOptions.optional(),
})

const GenericLocatorDebugEventSchema = z.object({
  method: z.literal('locator.*'),
  name: z.string(),
  locator: ElementLocatorSchema,
  args: z.array(z.unknown()),
})

const GenericBrowserContextDebugEventSchema = z.object({
  method: z.literal('browserContext.*'),
  name: z.string(),
  args: z.array(z.unknown()),
})

export const AnyBrowserDebugEventSchema = z.discriminatedUnion('method', [
  // BrowserContext actions
  GenericBrowserContextDebugEventSchema,

  // Page actions
  PageGotoDebugEventSchema,
  PageReloadDebugEventSchema,
  PageWaitForNavigationDebugEventSchema,
  PageWaitForTimeoutDebugEventSchema,
  PageCloseDebugEventSchema,
  GenericPageDebugEventSchema,

  // Locator actions
  LocatorCheckDebugEventSchema,
  LocatorClearDebugEventSchema,
  LocatorClickDebugEventSchema,
  LocatorDoubleClickDebugEventSchema,
  LocatorFillDebugEventSchema,
  LocatorFocusDebugEventSchema,
  LocatorHoverDebugEventSchema,
  LocatorPressDebugEventSchema,
  LocatorSelectOptionDebugEventSchema,
  LocatorSetCheckedDebugEventSchema,
  LocatorTapDebugEventSchema,
  LocatorTypeDebugEventSchema,
  LocatorUncheckDebugEventSchema,
  LocatorWaitForDebugEventSchema,
  GenericLocatorDebugEventSchema,
])

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

export type BrowserReplayEvent = eventWithTime

export type PageGotoDebugEvent = z.infer<typeof PageGotoDebugEventSchema>
export type PageReloadDebugEvent = z.infer<typeof PageReloadDebugEventSchema>
export type PageWaitForNavigationDebugEvent = z.infer<
  typeof PageWaitForNavigationDebugEventSchema
>
export type PageWaitForTimeoutDebugEvent = z.infer<
  typeof PageWaitForTimeoutDebugEventSchema
>
export type GenericPageDebugEvent = z.infer<typeof GenericPageDebugEventSchema>

export type LocatorCheckDebugEvent = z.infer<
  typeof LocatorCheckDebugEventSchema
>
export type LocatorClearDebugEvent = z.infer<
  typeof LocatorClearDebugEventSchema
>
export type LocatorClickDebugEvent = z.infer<
  typeof LocatorClickDebugEventSchema
>

export type LocatorClickDebugEventButton = NonNullable<
  NonNullable<LocatorClickDebugEvent['options']>['button']
>

export type LocatorClickDebugEventModifier = NonNullable<
  NonNullable<LocatorClickDebugEvent['options']>['modifiers']
>[number]
export type LocatorDoubleClickDebugEvent = z.infer<
  typeof LocatorDoubleClickDebugEventSchema
>
export type LocatorFillDebugEvent = z.infer<typeof LocatorFillDebugEventSchema>
export type LocatorFocusDebugEvent = z.infer<
  typeof LocatorFocusDebugEventSchema
>
export type LocatorHoverDebugEvent = z.infer<
  typeof LocatorHoverDebugEventSchema
>
export type LocatorPressDebugEvent = z.infer<
  typeof LocatorPressDebugEventSchema
>
export type LocatorSelectOptionDebugEvent = z.infer<
  typeof LocatorSelectOptionDebugEventSchema
>
export type LocatorSetCheckedDebugEvent = z.infer<
  typeof LocatorSetCheckedDebugEventSchema
>
export type LocatorTapDebugEvent = z.infer<typeof LocatorTapDebugEventSchema>
export type LocatorTypeDebugEvent = z.infer<typeof LocatorTypeDebugEventSchema>
export type LocatorUncheckDebugEvent = z.infer<
  typeof LocatorUncheckDebugEventSchema
>
export type LocatorWaitForDebugEvent = z.infer<
  typeof LocatorWaitForDebugEventSchema
>

export type GenericLocatorDebugEvent = z.infer<
  typeof GenericLocatorDebugEventSchema
>

export type GenericBrowserContextDebugEvent = z.infer<
  typeof GenericBrowserContextDebugEventSchema
>

export type AnyBrowserDebugEvent = z.infer<typeof AnyBrowserDebugEventSchema>

// =============================================================================
// Serialized Value Schemas
// =============================================================================

const UndefinedValueSchema = z.object({ type: z.literal('undefined') })

const DateValueSchema = z.object({
  type: z.literal('date'),
  timestamp: z.number(),
})

const RegexValueSchema = z.object({
  type: z.literal('regex'),
  pattern: z.string(),
  flags: z.string(),
})

const FunctionValueSchema = z.object({
  type: z.literal('function'),
  name: z.string(),
  source: z.string(),
})

const SymbolValueSchema = z.object({
  type: z.literal('symbol'),
  value: z.string(),
})

const LocatorValueSchema = z.object({
  type: z.literal('locator'),
  locator: ElementLocatorSchema,
})

const PageValueSchema = z.object({ type: z.literal('page') })

interface ObjectValue {
  type: 'object'
  value: Record<string, SerializedValue>
}

const ObjectValueSchema: z.ZodType<ObjectValue> = z.object({
  type: z.literal('object'),
  value: z.record(
    z.string(),
    z.lazy(() => SerializedValueSchema)
  ),
})

export type SerializedValue =
  | string
  | boolean
  | number
  | null
  | z.infer<typeof UndefinedValueSchema>
  | SerializedValue[]
  | ObjectValue
  | z.infer<typeof DateValueSchema>
  | z.infer<typeof RegexValueSchema>
  | z.infer<typeof FunctionValueSchema>
  | z.infer<typeof SymbolValueSchema>
  | z.infer<typeof LocatorValueSchema>
  | z.infer<typeof PageValueSchema>

export const SerializedValueSchema: z.ZodType<SerializedValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.boolean(),
    z.number(),
    z.null(),
    z.array(SerializedValueSchema),
    UndefinedValueSchema,
    ObjectValueSchema,
    DateValueSchema,
    RegexValueSchema,
    FunctionValueSchema,
    SymbolValueSchema,
    LocatorValueSchema,
    PageValueSchema,
  ])
)

// =============================================================================
// Assertion Schemas
// =============================================================================

// options?: Partial<RetryConfig> — shared arg shape for locator matchers
const withOptions = z.union([z.tuple([]), z.tuple([z.unknown()])])

// with text match options
const withExpectedAndOptions = z.union([
  z.tuple([SerializedValueSchema]),
  z.tuple([SerializedValueSchema, z.unknown()]),
])

// Locator assertions
const ExpectToBeCheckedSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeChecked'),
    negated: z.boolean(),
    args: withOptions,
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeDisabledSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeDisabled'),
    negated: z.boolean(),
    args: withOptions,
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeEditableSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeEditable'),
    negated: z.boolean(),
    args: withOptions,
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeEmptySchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeEmpty'),
    negated: z.boolean(),
    args: withOptions,
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeEnabledSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeEnabled'),
    negated: z.boolean(),
    args: withOptions,
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeHiddenSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeHidden'),
    negated: z.boolean(),
    args: withOptions,
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeVisibleSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeVisible'),
    negated: z.boolean(),
    args: withOptions,
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToHaveAttributeSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toHaveAttribute'),
    negated: z.boolean(),
    // (attribute: string, expectedValue?: string)
    args: z.union([z.tuple([z.string()]), z.tuple([z.string(), z.string()])]),
  })
  .transform(({ matcher, negated, args }) => {
    const [attribute, value] = args
    return {
      method: matcher,
      negated,
      attribute,
      ...(value !== undefined ? { value } : {}),
    }
  })

const ExpectToHaveTextSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toHaveText'),
    negated: z.boolean(),
    // (expected: RegExp | string, options?) — RegExp does not survive JSON serialization
    args: withExpectedAndOptions,
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToContainTextSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toContainText'),
    negated: z.boolean(),
    // (expected: RegExp | string, options?)
    args: withExpectedAndOptions,
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToHaveTitleSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toHaveTitle'),
    negated: z.boolean(),
    // (expected: RegExp | string, options?)
    args: withExpectedAndOptions,
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToHaveValueSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toHaveValue'),
    negated: z.boolean(),
    // (value: string, options?)
    args: z.union([z.tuple([z.string()]), z.tuple([z.string(), z.unknown()])]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    value: args[0],
  }))

// Generic value assertions
const ExpectToBeSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBe'),
    negated: z.boolean(),
    // (expected: unknown)
    args: z.tuple([SerializedValueSchema]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToBeCloseToSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeCloseTo'),
    negated: z.boolean(),
    // (expected: number, precision?: number)
    args: z.union([z.tuple([z.number()]), z.tuple([z.number(), z.number()])]),
  })
  .transform(({ matcher, negated, args }) => {
    const [expected, precision] = args
    return {
      method: matcher,
      negated,
      expected,
      ...(precision !== undefined ? { precision } : {}),
    }
  })

// serializeValue(bigint) coerces to Number(), so the wire value is always z.number()
const ExpectToBeGreaterThanSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeGreaterThan'),
    negated: z.boolean(),
    // (expected: number | bigint)
    args: z.tuple([z.number()]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToBeGreaterThanOrEqualSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeGreaterThanOrEqual'),
    negated: z.boolean(),
    // (expected: number | bigint)
    args: z.tuple([z.number()]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToBeLessThanSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeLessThan'),
    negated: z.boolean(),
    // (expected: number | bigint)
    args: z.tuple([z.number()]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToBeLessThanOrEqualSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeLessThanOrEqual'),
    negated: z.boolean(),
    // (expected: number | bigint)
    args: z.tuple([z.number()]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToBeDefinedSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeDefined'),
    negated: z.boolean(),
    args: z.tuple([]),
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeFalsySchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeFalsy'),
    negated: z.boolean(),
    args: z.tuple([]),
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeInstanceOfSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeInstanceOf'),
    negated: z.boolean(),
    // (expected: Function) — does not survive JSON serialization
    args: z.tuple([SerializedValueSchema]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToBeNaNSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeNaN'),
    negated: z.boolean(),
    args: z.tuple([]),
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeNullSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeNull'),
    negated: z.boolean(),
    args: z.tuple([]),
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeTruthySchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeTruthy'),
    negated: z.boolean(),
    args: z.tuple([]),
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToBeUndefinedSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toBeUndefined'),
    negated: z.boolean(),
    args: z.tuple([]),
  })
  .transform(({ matcher, negated }) => ({ method: matcher, negated }))

const ExpectToEqualSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toEqual'),
    negated: z.boolean(),
    // (expected: unknown)
    args: z.tuple([SerializedValueSchema]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToContainSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toContain'),
    negated: z.boolean(),
    // (expected: ItemType<Received>)
    args: z.tuple([SerializedValueSchema]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToContainEqualSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toContainEqual'),
    negated: z.boolean(),
    // (expected: unknown)
    args: z.tuple([SerializedValueSchema]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToHaveLengthSchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toHaveLength'),
    negated: z.boolean(),
    // (expected: number)
    args: z.tuple([z.number()]),
  })
  .transform(({ matcher, negated, args }) => ({
    method: matcher,
    negated,
    expected: args[0],
  }))

const ExpectToHavePropertySchema = z
  .object({
    name: z.string(),
    matcher: z.literal('toHaveProperty'),
    negated: z.boolean(),
    // (keyPath: string, expected?: unknown)
    args: z.union([
      z.tuple([z.string()]),
      z.tuple([z.string(), SerializedValueSchema]),
    ]),
  })
  .transform(({ matcher, negated, args }) => {
    const [keyPath, expected] = args
    return {
      method: matcher,
      negated,
      keyPath,
      ...(expected !== undefined ? { expected } : {}),
    }
  })

const GenericAssertionSchema = z
  .object({
    name: z.string(),
    matcher: z.undefined().optional(),
    negated: z.boolean(),
    args: z.array(SerializedValueSchema),
  })
  .transform(({ name, negated, args }) => ({
    method: '*' as const,
    name,
    negated,
    args,
  }))

export const AnyAssertionSchema = z.union([
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
  expected: SerializedValueSchema,
  received: SerializedValueSchema,
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
  expected: SerializedValueSchema,
  received: z.string(),
  message: z.string().optional(),
})

const TypeMismatchErrorSchema = z.object({
  format: z.literal('type-mismatch'),
  expected: z.array(SerializedValueSchema),
  received: SerializedValueSchema,
  message: z.string().optional(),
})

const CustomErrorSchema = z.object({
  format: z.literal('custom'),
  content: SerializedValueSchema,
  message: z.string().optional(),
})

const ReceivedOnlyErrorSchema = z.object({
  format: z.literal('received'),
  received: SerializedValueSchema,
  message: z.string().optional(),
})

interface TraceError {
  format: 'trace'
  inner: AssertionError
  trace: string[]
  message?: string
}

const TraceErrorSchema = z.object({
  format: z.literal('trace'),
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

export type AssertionError =
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

const ActionEventSchemaBase = z.object({
  type: z.literal('action'),
  eventId: z.string(),
  action: AnyBrowserDebugEventSchema,
})

export const ActionBeginEventSchema = ActionEventSchemaBase.extend({
  state: z.literal('begin'),
  timestamp: z.object({
    started: z.number(),
    ended: z.undefined().optional(),
  }),
  result: z.undefined().optional(),
})

export const ActionSuccessSchema = z.object({
  type: z.literal('pass'),
  returnValue: z.unknown().optional(),
})

export const ActionErrorSchema = z.object({
  type: z.literal('error'),
  error: z.string(),
})

export const ActionAbortedSchema = z.object({
  type: z.literal('aborted'),
})

export const ActionResultSchema = z.discriminatedUnion('type', [
  ActionSuccessSchema,
  ActionErrorSchema,
  ActionAbortedSchema,
])

export const ActionEndEventSchema = ActionEventSchemaBase.extend({
  state: z.literal('end'),
  timestamp: z.object({
    started: z.number(),
    ended: z.number(),
  }),
  result: ActionResultSchema,
})

export const BrowserActionEventSchema = z.discriminatedUnion('state', [
  ActionBeginEventSchema,
  ActionEndEventSchema,
])

const AssertionPassResultSchema = z.object({
  type: z.literal('pass'),
})

const AssertionFailResultSchema = z.object({
  type: z.literal('fail'),
  message: z.string().optional(),
  error: AssertionErrorSchema,
})

const AssertionErrorResultSchema = z.object({
  type: z.literal('error'),
  message: z.string().optional(),
  error: z.unknown(),
})

const AssertionAbortedResultSchema = z.object({
  type: z.literal('aborted'),
})

export const AssertionResultSchema = z.discriminatedUnion('type', [
  AssertionPassResultSchema,
  AssertionFailResultSchema,
  AssertionErrorResultSchema,
  AssertionAbortedResultSchema,
])

const AssertionEventBaseSchema = z.object({
  type: z.literal('assertion'),
  eventId: z.string(),
  actual: SerializedValueSchema,
  assertion: AnyAssertionSchema,
})

export const AssertionBeginEventSchema = AssertionEventBaseSchema.extend({
  state: z.literal('begin'),
  timestamp: z.object({
    started: z.number(),
    ended: z.undefined().optional(),
  }),
  result: z.undefined().optional(),
})

export const AssertionEndEventSchema = AssertionEventBaseSchema.extend({
  state: z.literal('end'),
  timestamp: z.object({
    started: z.number(),
    ended: z.number(),
  }),
  result: AssertionResultSchema,
})

export const BrowserAssertionEventSchema = z.discriminatedUnion('state', [
  AssertionBeginEventSchema,
  AssertionEndEventSchema,
])

export const BrowserDebuggerBeginEventSchema = z.discriminatedUnion('type', [
  ActionBeginEventSchema,
  AssertionBeginEventSchema,
])

export const BrowserDebuggerEndEventSchema = z.discriminatedUnion('type', [
  ActionEndEventSchema,
  AssertionEndEventSchema,
])

export type AnyAssertion = z.infer<typeof AnyAssertionSchema>

export type ActionBeginEvent = z.infer<typeof ActionBeginEventSchema>
export type ActionEndEvent = z.infer<typeof ActionEndEventSchema>
export type BrowserActionEvent = z.infer<typeof BrowserActionEventSchema>
export type ActionResultSchema = z.infer<typeof ActionResultSchema>

export type AssertionResult = z.infer<typeof AssertionResultSchema>
export type AssertionBeginEvent = z.infer<typeof AssertionBeginEventSchema>
export type AssertionEndEvent = z.infer<typeof AssertionEndEventSchema>
export type BrowserAssertionEvent = z.infer<typeof BrowserAssertionEventSchema>

export type BrowserDebuggerBeginEvent = z.infer<
  typeof BrowserDebuggerBeginEventSchema
>
export type BrowserDebuggerEndEvent = z.infer<
  typeof BrowserDebuggerEndEventSchema
>

export type BrowserDebuggerEvent =
  | BrowserDebuggerBeginEvent
  | BrowserDebuggerEndEvent

export function isBrowserAssertion(event: BrowserAssertionEvent) {
  switch (event.assertion.method) {
    case 'toBeChecked':
    case 'toBeDisabled':
    case 'toBeEditable':
    case 'toBeEmpty':
    case 'toBeEnabled':
    case 'toBeHidden':
    case 'toBeVisible':
    case 'toHaveAttribute':
    case 'toHaveText':
    case 'toContainText':
    case 'toHaveTitle':
    case 'toHaveValue':
      return true

    default:
      return false
  }
}
