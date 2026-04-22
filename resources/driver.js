import { browser } from 'k6/browser'
import { WebSocket } from 'k6/websockets'

/** A special constant with type `never` */
function $constructor(name, initializer, params) {
  function init(inst, def) {
    var _a
    Object.defineProperty(inst, '_zod', {
      value: inst._zod ?? {},
      enumerable: false,
    })
    ;(_a = inst._zod).traits ?? (_a.traits = new Set())
    inst._zod.traits.add(name)
    initializer(inst, def)
    // support prototype modifications
    for (const k in _.prototype) {
      if (!(k in inst))
        Object.defineProperty(inst, k, { value: _.prototype[k].bind(inst) })
    }
    inst._zod.constr = _
    inst._zod.def = def
  }
  // doesn't work if Parent has a constructor with arguments
  const Parent = params?.Parent ?? Object
  class Definition extends Parent {}
  Object.defineProperty(Definition, 'name', { value: name })
  function _(def) {
    var _a
    const inst = params?.Parent ? new Definition() : this
    init(inst, def)
    ;(_a = inst._zod).deferred ?? (_a.deferred = [])
    for (const fn of inst._zod.deferred) {
      fn()
    }
    return inst
  }
  Object.defineProperty(_, 'init', { value: init })
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent) return true
      return inst?._zod?.traits?.has(name)
    },
  })
  Object.defineProperty(_, 'name', { value: name })
  return _
}
class $ZodAsyncError extends Error {
  constructor() {
    super(
      `Encountered Promise during synchronous parse. Use .parseAsync() instead.`
    )
  }
}
const globalConfig = {}
function config(newConfig) {
  return globalConfig
}

// functions
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter(
    (v) => typeof v === 'number'
  )
  const values = Object.entries(entries)
    .filter(([k, _]) => numericValues.indexOf(+k) === -1)
    .map(([_, v]) => v)
  return values
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === 'bigint') return value.toString()
  return value
}
function cached(getter) {
  return {
    get value() {
      {
        const value = getter()
        Object.defineProperty(this, 'value', { value })
        return value
      }
    },
  }
}
function nullish(input) {
  return input === null || input === undefined
}
function cleanRegex(source) {
  const start = source.startsWith('^') ? 1 : 0
  const end = source.endsWith('$') ? source.length - 1 : source.length
  return source.slice(start, end)
}
function defineLazy(object, key, getter) {
  Object.defineProperty(object, key, {
    get() {
      {
        const value = getter()
        object[key] = value
        return value
      }
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v,
        // configurable: true,
      })
      // object[key] = v;
    },
    configurable: true,
  })
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  })
}
function esc(str) {
  return JSON.stringify(str)
}
const captureStackTrace = Error.captureStackTrace
  ? Error.captureStackTrace
  : (..._args) => {}
function isObject(data) {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
}
const allowsEval = cached(() => {
  if (
    typeof navigator !== 'undefined' &&
    navigator?.userAgent?.includes('Cloudflare')
  ) {
    return false
  }
  try {
    const F = Function
    new F('')
    return true
  } catch (_) {
    return false
  }
})
function isPlainObject(o) {
  if (isObject(o) === false) return false
  // modified constructor
  const ctor = o.constructor
  if (ctor === undefined) return true
  // modified prototype
  const prot = ctor.prototype
  if (isObject(prot) === false) return false
  // ctor doesn't have static `isPrototypeOf`
  if (Object.prototype.hasOwnProperty.call(prot, 'isPrototypeOf') === false) {
    return false
  }
  return true
}
const propertyKeyTypes = new Set(['string', 'number', 'symbol'])
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
// zod-specific utils
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def)
  if (!def || params?.parent) cl._zod.parent = inst
  return cl
}
function normalizeParams(_params) {
  const params = _params
  if (!params) return {}
  if (typeof params === 'string') return { error: () => params }
  if (params?.message !== undefined) {
    if (params?.error !== undefined)
      throw new Error('Cannot specify both `message` and `error` params')
    params.error = params.message
  }
  delete params.message
  if (typeof params.error === 'string')
    return { ...params, error: () => params.error }
  return params
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return (
      shape[k]._zod.optin === 'optional' && shape[k]._zod.optout === 'optional'
    )
  })
}
function pick(schema, mask) {
  const newShape = {}
  const currDef = schema._zod.def //.shape;
  for (const key in mask) {
    if (!(key in currDef.shape)) {
      throw new Error(`Unrecognized key: "${key}"`)
    }
    if (!mask[key]) continue
    // pick key
    newShape[key] = currDef.shape[key]
  }
  return clone(schema, {
    ...schema._zod.def,
    shape: newShape,
    checks: [],
  })
}
function omit(schema, mask) {
  const newShape = { ...schema._zod.def.shape }
  const currDef = schema._zod.def //.shape;
  for (const key in mask) {
    if (!(key in currDef.shape)) {
      throw new Error(`Unrecognized key: "${key}"`)
    }
    if (!mask[key]) continue
    delete newShape[key]
  }
  return clone(schema, {
    ...schema._zod.def,
    shape: newShape,
    checks: [],
  })
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error('Invalid input to extend: expected a plain object')
  }
  const def = {
    ...schema._zod.def,
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape }
      assignProp(this, 'shape', _shape) // self-caching
      return _shape
    },
    checks: [], // delete existing checks
  }
  return clone(schema, def)
}
function merge(a, b) {
  return clone(a, {
    ...a._zod.def,
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape }
      assignProp(this, 'shape', _shape) // self-caching
      return _shape
    },
    catchall: b._zod.def.catchall,
    checks: [], // delete existing checks
  })
}
function partial(Class, schema, mask) {
  const oldShape = schema._zod.def.shape
  const shape = { ...oldShape }
  if (mask) {
    for (const key in mask) {
      if (!(key in oldShape)) {
        throw new Error(`Unrecognized key: "${key}"`)
      }
      if (!mask[key]) continue
      // if (oldShape[key]!._zod.optin === "optional") continue;
      shape[key] = Class
        ? new Class({
            type: 'optional',
            innerType: oldShape[key],
          })
        : oldShape[key]
    }
  } else {
    for (const key in oldShape) {
      // if (oldShape[key]!._zod.optin === "optional") continue;
      shape[key] = Class
        ? new Class({
            type: 'optional',
            innerType: oldShape[key],
          })
        : oldShape[key]
    }
  }
  return clone(schema, {
    ...schema._zod.def,
    shape,
    checks: [],
  })
}
function required(Class, schema, mask) {
  const oldShape = schema._zod.def.shape
  const shape = { ...oldShape }
  if (mask) {
    for (const key in mask) {
      if (!(key in shape)) {
        throw new Error(`Unrecognized key: "${key}"`)
      }
      if (!mask[key]) continue
      // overwrite with non-optional
      shape[key] = new Class({
        type: 'nonoptional',
        innerType: oldShape[key],
      })
    }
  } else {
    for (const key in oldShape) {
      // overwrite with non-optional
      shape[key] = new Class({
        type: 'nonoptional',
        innerType: oldShape[key],
      })
    }
  }
  return clone(schema, {
    ...schema._zod.def,
    shape,
    // optional: [],
    checks: [],
  })
}
function aborted(x, startIndex = 0) {
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) return true
  }
  return false
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a
    ;(_a = iss).path ?? (_a.path = [])
    iss.path.unshift(path)
    return iss
  })
}
function unwrapMessage(message) {
  return typeof message === 'string' ? message : message?.message
}
function finalizeIssue(iss, ctx, config) {
  const full = { ...iss, path: iss.path ?? [] }
  // for backwards compatibility
  if (!iss.message) {
    const message =
      unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ??
      unwrapMessage(ctx?.error?.(iss)) ??
      unwrapMessage(config.customError?.(iss)) ??
      unwrapMessage(config.localeError?.(iss)) ??
      'Invalid input'
    full.message = message
  }
  // delete (full as any).def;
  delete full.inst
  delete full.continue
  if (!ctx?.reportInput) {
    delete full.input
  }
  return full
}
function getLengthableOrigin(input) {
  if (Array.isArray(input)) return 'array'
  if (typeof input === 'string') return 'string'
  return 'unknown'
}
function issue(...args) {
  const [iss, input, inst] = args
  if (typeof iss === 'string') {
    return {
      message: iss,
      code: 'custom',
      input,
      inst,
    }
  }
  return { ...iss }
}

const initializer$1 = (inst, def) => {
  inst.name = '$ZodError'
  Object.defineProperty(inst, '_zod', {
    value: inst._zod,
    enumerable: false,
  })
  Object.defineProperty(inst, 'issues', {
    value: def,
    enumerable: false,
  })
  Object.defineProperty(inst, 'message', {
    get() {
      return JSON.stringify(def, jsonStringifyReplacer, 2)
    },
    enumerable: true,
    // configurable: false,
  })
  Object.defineProperty(inst, 'toString', {
    value: () => inst.message,
    enumerable: false,
  })
}
const $ZodError = $constructor('$ZodError', initializer$1)
const $ZodRealError = $constructor('$ZodError', initializer$1, {
  Parent: Error,
})
function flattenError(error, mapper = (issue) => issue.message) {
  const fieldErrors = {}
  const formErrors = []
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || []
      fieldErrors[sub.path[0]].push(mapper(sub))
    } else {
      formErrors.push(mapper(sub))
    }
  }
  return { formErrors, fieldErrors }
}
function formatError(error, _mapper) {
  const mapper =
    _mapper ||
    function (issue) {
      return issue.message
    }
  const fieldErrors = { _errors: [] }
  const processError = (error) => {
    for (const issue of error.issues) {
      if (issue.code === 'invalid_union' && issue.errors.length) {
        issue.errors.map((issues) => processError({ issues }))
      } else if (issue.code === 'invalid_key') {
        processError({ issues: issue.issues })
      } else if (issue.code === 'invalid_element') {
        processError({ issues: issue.issues })
      } else if (issue.path.length === 0) {
        fieldErrors._errors.push(mapper(issue))
      } else {
        let curr = fieldErrors
        let i = 0
        while (i < issue.path.length) {
          const el = issue.path[i]
          const terminal = i === issue.path.length - 1
          if (!terminal) {
            curr[el] = curr[el] || { _errors: [] }
          } else {
            curr[el] = curr[el] || { _errors: [] }
            curr[el]._errors.push(mapper(issue))
          }
          curr = curr[el]
          i++
        }
      }
    }
  }
  processError(error)
  return fieldErrors
}

const _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false }
  const result = schema._zod.run({ value, issues: [] }, ctx)
  if (result instanceof Promise) {
    throw new $ZodAsyncError()
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(
      result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
    )
    captureStackTrace(e, _params?.callee)
    throw e
  }
  return result.value
}
const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true }
  let result = schema._zod.run({ value, issues: [] }, ctx)
  if (result instanceof Promise) result = await result
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(
      result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
    )
    captureStackTrace(e, params?.callee)
    throw e
  }
  return result.value
}
const _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false }
  const result = schema._zod.run({ value, issues: [] }, ctx)
  if (result instanceof Promise) {
    throw new $ZodAsyncError()
  }
  return result.issues.length
    ? {
        success: false,
        error: new (_Err ?? $ZodError)(
          result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        ),
      }
    : { success: true, data: result.value }
}
const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError)
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true }
  let result = schema._zod.run({ value, issues: [] }, ctx)
  if (result instanceof Promise) result = await result
  return result.issues.length
    ? {
        success: false,
        error: new _Err(
          result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        ),
      }
    : { success: true, data: result.value }
}
const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError)

const cuid = /^[cC][^\s-]{8,}$/
const cuid2 = /^[0-9a-z]+$/
const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/
const xid = /^[0-9a-vA-V]{20}$/
const ksuid = /^[A-Za-z0-9]{27}$/
const nanoid = /^[a-zA-Z0-9_-]{21}$/
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration$1 =
  /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid =
  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/
/** Returns a regex for validating an RFC 4122 UUID.
 *
 * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/
  return new RegExp(
    `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`
  )
}
/** Practical email validation */
const email =
  /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`
function emoji() {
  return new RegExp(_emoji$1, 'u')
}
const ipv4 =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/
const ipv6 =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/
const cidrv4 =
  /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/
const cidrv6 =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64 =
  /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/
const base64url = /^[A-Za-z0-9_-]*$/
// based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
// export const hostname: RegExp =
//   /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
const hostname = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/
// https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces)
const e164 = /^\+(?:[0-9]){6,14}[0-9]$/
// const dateSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`
const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`)
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`
  const regex =
    typeof args.precision === 'number'
      ? args.precision === -1
        ? `${hhmm}`
        : args.precision === 0
          ? `${hhmm}:[0-5]\\d`
          : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}`
      : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`
  return regex
}
function time$1(args) {
  return new RegExp(`^${timeSource(args)}$`)
}
// Adapted from https://stackoverflow.com/a/3143231
function datetime$1(args) {
  const time = timeSource({ precision: args.precision })
  const opts = ['Z']
  if (args.local) opts.push('')
  if (args.offset) opts.push(`([+-]\\d{2}:\\d{2})`)
  const timeRegex = `${time}(?:${opts.join('|')})`
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`)
}
const string$1 = (params) => {
  const regex = params
    ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ''}}`
    : `[\\s\\S]*`
  return new RegExp(`^${regex}$`)
}
const boolean$1 = /true|false/i
// regex for string with no uppercase letters
const lowercase = /^[^A-Z]*$/
// regex for string with no lowercase letters
const uppercase = /^[^a-z]*$/

// import { $ZodType } from "./schemas.js";
const $ZodCheck = /*@__PURE__*/ $constructor('$ZodCheck', (inst, def) => {
  var _a
  inst._zod ?? (inst._zod = {})
  inst._zod.def = def
  ;(_a = inst._zod).onattach ?? (_a.onattach = [])
})
const $ZodCheckMaxLength = /*@__PURE__*/ $constructor(
  '$ZodCheckMaxLength',
  (inst, def) => {
    var _a
    $ZodCheck.init(inst, def)
    ;(_a = inst._zod.def).when ??
      (_a.when = (payload) => {
        const val = payload.value
        return !nullish(val) && val.length !== undefined
      })
    inst._zod.onattach.push((inst) => {
      const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY
      if (def.maximum < curr) inst._zod.bag.maximum = def.maximum
    })
    inst._zod.check = (payload) => {
      const input = payload.value
      const length = input.length
      if (length <= def.maximum) return
      const origin = getLengthableOrigin(input)
      payload.issues.push({
        origin,
        code: 'too_big',
        maximum: def.maximum,
        inclusive: true,
        input,
        inst,
        continue: !def.abort,
      })
    }
  }
)
const $ZodCheckMinLength = /*@__PURE__*/ $constructor(
  '$ZodCheckMinLength',
  (inst, def) => {
    var _a
    $ZodCheck.init(inst, def)
    ;(_a = inst._zod.def).when ??
      (_a.when = (payload) => {
        const val = payload.value
        return !nullish(val) && val.length !== undefined
      })
    inst._zod.onattach.push((inst) => {
      const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY
      if (def.minimum > curr) inst._zod.bag.minimum = def.minimum
    })
    inst._zod.check = (payload) => {
      const input = payload.value
      const length = input.length
      if (length >= def.minimum) return
      const origin = getLengthableOrigin(input)
      payload.issues.push({
        origin,
        code: 'too_small',
        minimum: def.minimum,
        inclusive: true,
        input,
        inst,
        continue: !def.abort,
      })
    }
  }
)
const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor(
  '$ZodCheckLengthEquals',
  (inst, def) => {
    var _a
    $ZodCheck.init(inst, def)
    ;(_a = inst._zod.def).when ??
      (_a.when = (payload) => {
        const val = payload.value
        return !nullish(val) && val.length !== undefined
      })
    inst._zod.onattach.push((inst) => {
      const bag = inst._zod.bag
      bag.minimum = def.length
      bag.maximum = def.length
      bag.length = def.length
    })
    inst._zod.check = (payload) => {
      const input = payload.value
      const length = input.length
      if (length === def.length) return
      const origin = getLengthableOrigin(input)
      const tooBig = length > def.length
      payload.issues.push({
        origin,
        ...(tooBig
          ? { code: 'too_big', maximum: def.length }
          : { code: 'too_small', minimum: def.length }),
        inclusive: true,
        exact: true,
        input: payload.value,
        inst,
        continue: !def.abort,
      })
    }
  }
)
const $ZodCheckStringFormat = /*@__PURE__*/ $constructor(
  '$ZodCheckStringFormat',
  (inst, def) => {
    var _a, _b
    $ZodCheck.init(inst, def)
    inst._zod.onattach.push((inst) => {
      const bag = inst._zod.bag
      bag.format = def.format
      if (def.pattern) {
        bag.patterns ?? (bag.patterns = new Set())
        bag.patterns.add(def.pattern)
      }
    })
    if (def.pattern)
      (_a = inst._zod).check ??
        (_a.check = (payload) => {
          def.pattern.lastIndex = 0
          if (def.pattern.test(payload.value)) return
          payload.issues.push({
            origin: 'string',
            code: 'invalid_format',
            format: def.format,
            input: payload.value,
            ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
            inst,
            continue: !def.abort,
          })
        })
    else (_b = inst._zod).check ?? (_b.check = () => {})
  }
)
const $ZodCheckRegex = /*@__PURE__*/ $constructor(
  '$ZodCheckRegex',
  (inst, def) => {
    $ZodCheckStringFormat.init(inst, def)
    inst._zod.check = (payload) => {
      def.pattern.lastIndex = 0
      if (def.pattern.test(payload.value)) return
      payload.issues.push({
        origin: 'string',
        code: 'invalid_format',
        format: 'regex',
        input: payload.value,
        pattern: def.pattern.toString(),
        inst,
        continue: !def.abort,
      })
    }
  }
)
const $ZodCheckLowerCase = /*@__PURE__*/ $constructor(
  '$ZodCheckLowerCase',
  (inst, def) => {
    def.pattern ?? (def.pattern = lowercase)
    $ZodCheckStringFormat.init(inst, def)
  }
)
const $ZodCheckUpperCase = /*@__PURE__*/ $constructor(
  '$ZodCheckUpperCase',
  (inst, def) => {
    def.pattern ?? (def.pattern = uppercase)
    $ZodCheckStringFormat.init(inst, def)
  }
)
const $ZodCheckIncludes = /*@__PURE__*/ $constructor(
  '$ZodCheckIncludes',
  (inst, def) => {
    $ZodCheck.init(inst, def)
    const escapedRegex = escapeRegex(def.includes)
    const pattern = new RegExp(
      typeof def.position === 'number'
        ? `^.{${def.position}}${escapedRegex}`
        : escapedRegex
    )
    def.pattern = pattern
    inst._zod.onattach.push((inst) => {
      const bag = inst._zod.bag
      bag.patterns ?? (bag.patterns = new Set())
      bag.patterns.add(pattern)
    })
    inst._zod.check = (payload) => {
      if (payload.value.includes(def.includes, def.position)) return
      payload.issues.push({
        origin: 'string',
        code: 'invalid_format',
        format: 'includes',
        includes: def.includes,
        input: payload.value,
        inst,
        continue: !def.abort,
      })
    }
  }
)
const $ZodCheckStartsWith = /*@__PURE__*/ $constructor(
  '$ZodCheckStartsWith',
  (inst, def) => {
    $ZodCheck.init(inst, def)
    const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`)
    def.pattern ?? (def.pattern = pattern)
    inst._zod.onattach.push((inst) => {
      const bag = inst._zod.bag
      bag.patterns ?? (bag.patterns = new Set())
      bag.patterns.add(pattern)
    })
    inst._zod.check = (payload) => {
      if (payload.value.startsWith(def.prefix)) return
      payload.issues.push({
        origin: 'string',
        code: 'invalid_format',
        format: 'starts_with',
        prefix: def.prefix,
        input: payload.value,
        inst,
        continue: !def.abort,
      })
    }
  }
)
const $ZodCheckEndsWith = /*@__PURE__*/ $constructor(
  '$ZodCheckEndsWith',
  (inst, def) => {
    $ZodCheck.init(inst, def)
    const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`)
    def.pattern ?? (def.pattern = pattern)
    inst._zod.onattach.push((inst) => {
      const bag = inst._zod.bag
      bag.patterns ?? (bag.patterns = new Set())
      bag.patterns.add(pattern)
    })
    inst._zod.check = (payload) => {
      if (payload.value.endsWith(def.suffix)) return
      payload.issues.push({
        origin: 'string',
        code: 'invalid_format',
        format: 'ends_with',
        suffix: def.suffix,
        input: payload.value,
        inst,
        continue: !def.abort,
      })
    }
  }
)
const $ZodCheckOverwrite = /*@__PURE__*/ $constructor(
  '$ZodCheckOverwrite',
  (inst, def) => {
    $ZodCheck.init(inst, def)
    inst._zod.check = (payload) => {
      payload.value = def.tx(payload.value)
    }
  }
)

class Doc {
  constructor(args = []) {
    this.content = []
    this.indent = 0
    if (this) this.args = args
  }
  indented(fn) {
    this.indent += 1
    fn(this)
    this.indent -= 1
  }
  write(arg) {
    if (typeof arg === 'function') {
      arg(this, { execution: 'sync' })
      arg(this, { execution: 'async' })
      return
    }
    const content = arg
    const lines = content.split('\n').filter((x) => x)
    const minIndent = Math.min(
      ...lines.map((x) => x.length - x.trimStart().length)
    )
    const dedented = lines
      .map((x) => x.slice(minIndent))
      .map((x) => ' '.repeat(this.indent * 2) + x)
    for (const line of dedented) {
      this.content.push(line)
    }
  }
  compile() {
    const F = Function
    const args = this?.args
    const content = this?.content ?? [``]
    const lines = [...content.map((x) => `  ${x}`)]
    // console.log(lines.join("\n"));
    return new F(...args, lines.join('\n'))
  }
}

const version = {
  major: 4,
  minor: 0,
  patch: 0,
}

const $ZodType = /*@__PURE__*/ $constructor('$ZodType', (inst, def) => {
  var _a
  inst ?? (inst = {})
  inst._zod.def = def // set _def property
  inst._zod.bag = inst._zod.bag || {} // initialize _bag object
  inst._zod.version = version
  const checks = [...(inst._zod.def.checks ?? [])]
  // if inst is itself a checks.$ZodCheck, run it as a check
  if (inst._zod.traits.has('$ZodCheck')) {
    checks.unshift(inst)
  }
  //
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst)
    }
  }
  if (checks.length === 0) {
    // deferred initializer
    // inst._zod.parse is not yet defined
    ;(_a = inst._zod).deferred ?? (_a.deferred = [])
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse
    })
  } else {
    const runChecks = (payload, checks, ctx) => {
      let isAborted = aborted(payload)
      let asyncResult
      for (const ch of checks) {
        if (ch._zod.def.when) {
          const shouldRun = ch._zod.def.when(payload)
          if (!shouldRun) continue
        } else if (isAborted) {
          continue
        }
        const currLen = payload.issues.length
        const _ = ch._zod.check(payload)
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError()
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _
            const nextLen = payload.issues.length
            if (nextLen === currLen) return
            if (!isAborted) isAborted = aborted(payload, currLen)
          })
        } else {
          const nextLen = payload.issues.length
          if (nextLen === currLen) continue
          if (!isAborted) isAborted = aborted(payload, currLen)
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload
        })
      }
      return payload
    }
    inst._zod.run = (payload, ctx) => {
      const result = inst._zod.parse(payload, ctx)
      if (result instanceof Promise) {
        if (ctx.async === false) throw new $ZodAsyncError()
        return result.then((result) => runChecks(result, checks, ctx))
      }
      return runChecks(result, checks, ctx)
    }
  }
  inst['~standard'] = {
    validate: (value) => {
      try {
        const r = safeParse$1(inst, value)
        return r.success ? { value: r.data } : { issues: r.error?.issues }
      } catch (_) {
        return safeParseAsync$1(inst, value).then((r) =>
          r.success ? { value: r.data } : { issues: r.error?.issues }
        )
      }
    },
    vendor: 'zod',
    version: 1,
  }
})
const $ZodString = /*@__PURE__*/ $constructor('$ZodString', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.pattern =
    [...(inst?._zod.bag?.patterns ?? [])].pop() ?? string$1(inst._zod.bag)
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value)
      } catch (_) {}
    if (typeof payload.value === 'string') return payload
    payload.issues.push({
      expected: 'string',
      code: 'invalid_type',
      input: payload.value,
      inst,
    })
    return payload
  }
})
const $ZodStringFormat = /*@__PURE__*/ $constructor(
  '$ZodStringFormat',
  (inst, def) => {
    // check initialization must come first
    $ZodCheckStringFormat.init(inst, def)
    $ZodString.init(inst, def)
  }
)
const $ZodGUID = /*@__PURE__*/ $constructor('$ZodGUID', (inst, def) => {
  def.pattern ?? (def.pattern = guid)
  $ZodStringFormat.init(inst, def)
})
const $ZodUUID = /*@__PURE__*/ $constructor('$ZodUUID', (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8,
    }
    const v = versionMap[def.version]
    if (v === undefined)
      throw new Error(`Invalid UUID version: "${def.version}"`)
    def.pattern ?? (def.pattern = uuid(v))
  } else def.pattern ?? (def.pattern = uuid())
  $ZodStringFormat.init(inst, def)
})
const $ZodEmail = /*@__PURE__*/ $constructor('$ZodEmail', (inst, def) => {
  def.pattern ?? (def.pattern = email)
  $ZodStringFormat.init(inst, def)
})
const $ZodURL = /*@__PURE__*/ $constructor('$ZodURL', (inst, def) => {
  $ZodStringFormat.init(inst, def)
  inst._zod.check = (payload) => {
    try {
      const orig = payload.value
      const url = new URL(orig)
      const href = url.href
      if (def.hostname) {
        def.hostname.lastIndex = 0
        if (!def.hostname.test(url.hostname)) {
          payload.issues.push({
            code: 'invalid_format',
            format: 'url',
            note: 'Invalid hostname',
            pattern: hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort,
          })
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0
        if (
          !def.protocol.test(
            url.protocol.endsWith(':')
              ? url.protocol.slice(0, -1)
              : url.protocol
          )
        ) {
          payload.issues.push({
            code: 'invalid_format',
            format: 'url',
            note: 'Invalid protocol',
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort,
          })
        }
      }
      // payload.value = url.href;
      if (!orig.endsWith('/') && href.endsWith('/')) {
        payload.value = href.slice(0, -1)
      } else {
        payload.value = href
      }
      return
    } catch (_) {
      payload.issues.push({
        code: 'invalid_format',
        format: 'url',
        input: payload.value,
        inst,
        continue: !def.abort,
      })
    }
  }
})
const $ZodEmoji = /*@__PURE__*/ $constructor('$ZodEmoji', (inst, def) => {
  def.pattern ?? (def.pattern = emoji())
  $ZodStringFormat.init(inst, def)
})
const $ZodNanoID = /*@__PURE__*/ $constructor('$ZodNanoID', (inst, def) => {
  def.pattern ?? (def.pattern = nanoid)
  $ZodStringFormat.init(inst, def)
})
const $ZodCUID = /*@__PURE__*/ $constructor('$ZodCUID', (inst, def) => {
  def.pattern ?? (def.pattern = cuid)
  $ZodStringFormat.init(inst, def)
})
const $ZodCUID2 = /*@__PURE__*/ $constructor('$ZodCUID2', (inst, def) => {
  def.pattern ?? (def.pattern = cuid2)
  $ZodStringFormat.init(inst, def)
})
const $ZodULID = /*@__PURE__*/ $constructor('$ZodULID', (inst, def) => {
  def.pattern ?? (def.pattern = ulid)
  $ZodStringFormat.init(inst, def)
})
const $ZodXID = /*@__PURE__*/ $constructor('$ZodXID', (inst, def) => {
  def.pattern ?? (def.pattern = xid)
  $ZodStringFormat.init(inst, def)
})
const $ZodKSUID = /*@__PURE__*/ $constructor('$ZodKSUID', (inst, def) => {
  def.pattern ?? (def.pattern = ksuid)
  $ZodStringFormat.init(inst, def)
})
const $ZodISODateTime = /*@__PURE__*/ $constructor(
  '$ZodISODateTime',
  (inst, def) => {
    def.pattern ?? (def.pattern = datetime$1(def))
    $ZodStringFormat.init(inst, def)
  }
)
const $ZodISODate = /*@__PURE__*/ $constructor('$ZodISODate', (inst, def) => {
  def.pattern ?? (def.pattern = date$1)
  $ZodStringFormat.init(inst, def)
})
const $ZodISOTime = /*@__PURE__*/ $constructor('$ZodISOTime', (inst, def) => {
  def.pattern ?? (def.pattern = time$1(def))
  $ZodStringFormat.init(inst, def)
})
const $ZodISODuration = /*@__PURE__*/ $constructor(
  '$ZodISODuration',
  (inst, def) => {
    def.pattern ?? (def.pattern = duration$1)
    $ZodStringFormat.init(inst, def)
  }
)
const $ZodIPv4 = /*@__PURE__*/ $constructor('$ZodIPv4', (inst, def) => {
  def.pattern ?? (def.pattern = ipv4)
  $ZodStringFormat.init(inst, def)
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag
    bag.format = `ipv4`
  })
})
const $ZodIPv6 = /*@__PURE__*/ $constructor('$ZodIPv6', (inst, def) => {
  def.pattern ?? (def.pattern = ipv6)
  $ZodStringFormat.init(inst, def)
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag
    bag.format = `ipv6`
  })
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`)
      // return;
    } catch {
      payload.issues.push({
        code: 'invalid_format',
        format: 'ipv6',
        input: payload.value,
        inst,
        continue: !def.abort,
      })
    }
  }
})
const $ZodCIDRv4 = /*@__PURE__*/ $constructor('$ZodCIDRv4', (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4)
  $ZodStringFormat.init(inst, def)
})
const $ZodCIDRv6 = /*@__PURE__*/ $constructor('$ZodCIDRv6', (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6) // not used for validation
  $ZodStringFormat.init(inst, def)
  inst._zod.check = (payload) => {
    const [address, prefix] = payload.value.split('/')
    try {
      if (!prefix) throw new Error()
      const prefixNum = Number(prefix)
      if (`${prefixNum}` !== prefix) throw new Error()
      if (prefixNum < 0 || prefixNum > 128) throw new Error()
      new URL(`http://[${address}]`)
    } catch {
      payload.issues.push({
        code: 'invalid_format',
        format: 'cidrv6',
        input: payload.value,
        inst,
        continue: !def.abort,
      })
    }
  }
})
//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64(data) {
  if (data === '') return true
  if (data.length % 4 !== 0) return false
  try {
    atob(data)
    return true
  } catch {
    return false
  }
}
const $ZodBase64 = /*@__PURE__*/ $constructor('$ZodBase64', (inst, def) => {
  def.pattern ?? (def.pattern = base64)
  $ZodStringFormat.init(inst, def)
  inst._zod.onattach.push((inst) => {
    inst._zod.bag.contentEncoding = 'base64'
  })
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value)) return
    payload.issues.push({
      code: 'invalid_format',
      format: 'base64',
      input: payload.value,
      inst,
      continue: !def.abort,
    })
  }
})
//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64URL(data) {
  if (!base64url.test(data)) return false
  const base64 = data.replace(/[-_]/g, (c) => (c === '-' ? '+' : '/'))
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  return isValidBase64(padded)
}
const $ZodBase64URL = /*@__PURE__*/ $constructor(
  '$ZodBase64URL',
  (inst, def) => {
    def.pattern ?? (def.pattern = base64url)
    $ZodStringFormat.init(inst, def)
    inst._zod.onattach.push((inst) => {
      inst._zod.bag.contentEncoding = 'base64url'
    })
    inst._zod.check = (payload) => {
      if (isValidBase64URL(payload.value)) return
      payload.issues.push({
        code: 'invalid_format',
        format: 'base64url',
        input: payload.value,
        inst,
        continue: !def.abort,
      })
    }
  }
)
const $ZodE164 = /*@__PURE__*/ $constructor('$ZodE164', (inst, def) => {
  def.pattern ?? (def.pattern = e164)
  $ZodStringFormat.init(inst, def)
})
//////////////////////////////   ZodJWT   //////////////////////////////
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split('.')
    if (tokensParts.length !== 3) return false
    const [header] = tokensParts
    if (!header) return false
    const parsedHeader = JSON.parse(atob(header))
    if ('typ' in parsedHeader && parsedHeader?.typ !== 'JWT') return false
    if (!parsedHeader.alg) return false
    if (
      algorithm &&
      (!('alg' in parsedHeader) || parsedHeader.alg !== algorithm)
    )
      return false
    return true
  } catch {
    return false
  }
}
const $ZodJWT = /*@__PURE__*/ $constructor('$ZodJWT', (inst, def) => {
  $ZodStringFormat.init(inst, def)
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg)) return
    payload.issues.push({
      code: 'invalid_format',
      format: 'jwt',
      input: payload.value,
      inst,
      continue: !def.abort,
    })
  }
})
const $ZodBoolean = /*@__PURE__*/ $constructor('$ZodBoolean', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.pattern = boolean$1
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value)
      } catch (_) {}
    const input = payload.value
    if (typeof input === 'boolean') return payload
    payload.issues.push({
      expected: 'boolean',
      code: 'invalid_type',
      input,
      inst,
    })
    return payload
  }
})
const $ZodUnknown = /*@__PURE__*/ $constructor('$ZodUnknown', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.parse = (payload) => payload
})
const $ZodNever = /*@__PURE__*/ $constructor('$ZodNever', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: 'never',
      code: 'invalid_type',
      input: payload.value,
      inst,
    })
    return payload
  }
})
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues))
  }
  final.value[index] = result.value
}
const $ZodArray = /*@__PURE__*/ $constructor('$ZodArray', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: 'array',
        code: 'invalid_type',
        input,
        inst,
      })
      return payload
    }
    payload.value = Array(input.length)
    const proms = []
    for (let i = 0; i < input.length; i++) {
      const item = input[i]
      const result = def.element._zod.run(
        {
          value: item,
          issues: [],
        },
        ctx
      )
      if (result instanceof Promise) {
        proms.push(
          result.then((result) => handleArrayResult(result, payload, i))
        )
      } else {
        handleArrayResult(result, payload, i)
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload)
    }
    return payload //handleArrayResultsAsync(parseResults, final);
  }
})
function handleObjectResult(result, final, key) {
  // if(isOptional)
  if (result.issues.length) {
    final.issues.push(...prefixIssues(key, result.issues))
  }
  final.value[key] = result.value
}
function handleOptionalObjectResult(result, final, key, input) {
  if (result.issues.length) {
    // validation failed against value schema
    if (input[key] === undefined) {
      // if input was undefined, ignore the error
      if (key in input) {
        final.value[key] = undefined
      } else {
        final.value[key] = result.value
      }
    } else {
      final.issues.push(...prefixIssues(key, result.issues))
    }
  } else if (result.value === undefined) {
    // validation returned `undefined`
    if (key in input) final.value[key] = undefined
  } else {
    // non-undefined value
    final.value[key] = result.value
  }
}
const $ZodObject = /*@__PURE__*/ $constructor('$ZodObject', (inst, def) => {
  // requires cast because technically $ZodObject doesn't extend
  $ZodType.init(inst, def)
  const _normalized = cached(() => {
    const keys = Object.keys(def.shape)
    for (const k of keys) {
      if (!(def.shape[k] instanceof $ZodType)) {
        throw new Error(`Invalid element at key "${k}": expected a Zod schema`)
      }
    }
    const okeys = optionalKeys(def.shape)
    return {
      shape: def.shape,
      keys,
      keySet: new Set(keys),
      numKeys: keys.length,
      optionalKeys: new Set(okeys),
    }
  })
  defineLazy(inst._zod, 'propValues', () => {
    const shape = def.shape
    const propValues = {}
    for (const key in shape) {
      const field = shape[key]._zod
      if (field.values) {
        propValues[key] ?? (propValues[key] = new Set())
        for (const v of field.values) propValues[key].add(v)
      }
    }
    return propValues
  })
  const generateFastpass = (shape) => {
    const doc = new Doc(['shape', 'payload', 'ctx'])
    const normalized = _normalized.value
    const parseStr = (key) => {
      const k = esc(key)
      return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`
    }
    doc.write(`const input = payload.value;`)
    const ids = Object.create(null)
    let counter = 0
    for (const key of normalized.keys) {
      ids[key] = `key_${counter++}`
    }
    // A: preserve key order {
    doc.write(`const newResult = {}`)
    for (const key of normalized.keys) {
      if (normalized.optionalKeys.has(key)) {
        const id = ids[key]
        doc.write(`const ${id} = ${parseStr(key)};`)
        const k = esc(key)
        doc.write(`
        if (${id}.issues.length) {
          if (input[${k}] === undefined) {
            if (${k} in input) {
              newResult[${k}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${id}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${k}, ...iss.path] : [${k}],
              }))
            );
          }
        } else if (${id}.value === undefined) {
          if (${k} in input) newResult[${k}] = undefined;
        } else {
          newResult[${k}] = ${id}.value;
        }
        `)
      } else {
        const id = ids[key]
        //  const id = ids[key];
        doc.write(`const ${id} = ${parseStr(key)};`)
        doc.write(`
          if (${id}.issues.length) payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${esc(key)}, ...iss.path] : [${esc(key)}]
          })));`)
        doc.write(`newResult[${esc(key)}] = ${id}.value`)
      }
    }
    doc.write(`payload.value = newResult;`)
    doc.write(`return payload;`)
    const fn = doc.compile()
    return (payload, ctx) => fn(shape, payload, ctx)
  }
  let fastpass
  const isObject$1 = isObject
  const jit = !globalConfig.jitless
  const allowsEval$1 = allowsEval
  const fastEnabled = jit && allowsEval$1.value // && !def.catchall;
  const catchall = def.catchall
  let value
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value)
    const input = payload.value
    if (!isObject$1(input)) {
      payload.issues.push({
        expected: 'object',
        code: 'invalid_type',
        input,
        inst,
      })
      return payload
    }
    const proms = []
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      // always synchronous
      if (!fastpass) fastpass = generateFastpass(def.shape)
      payload = fastpass(payload, ctx)
    } else {
      payload.value = {}
      const shape = value.shape
      for (const key of value.keys) {
        const el = shape[key]
        // do not add omitted optional keys
        // if (!(key in input)) {
        //   if (optionalKeys.has(key)) continue;
        //   payload.issues.push({
        //     code: "invalid_type",
        //     path: [key],
        //     expected: "nonoptional",
        //     note: `Missing required key: "${key}"`,
        //     input,
        //     inst,
        //   });
        // }
        const r = el._zod.run({ value: input[key], issues: [] }, ctx)
        const isOptional =
          el._zod.optin === 'optional' && el._zod.optout === 'optional'
        if (r instanceof Promise) {
          proms.push(
            r.then((r) =>
              isOptional
                ? handleOptionalObjectResult(r, payload, key, input)
                : handleObjectResult(r, payload, key)
            )
          )
        } else if (isOptional) {
          handleOptionalObjectResult(r, payload, key, input)
        } else {
          handleObjectResult(r, payload, key)
        }
      }
    }
    if (!catchall) {
      // return payload;
      return proms.length ? Promise.all(proms).then(() => payload) : payload
    }
    const unrecognized = []
    // iterate over input keys
    const keySet = value.keySet
    const _catchall = catchall._zod
    const t = _catchall.def.type
    for (const key of Object.keys(input)) {
      if (keySet.has(key)) continue
      if (t === 'never') {
        unrecognized.push(key)
        continue
      }
      const r = _catchall.run({ value: input[key], issues: [] }, ctx)
      if (r instanceof Promise) {
        proms.push(r.then((r) => handleObjectResult(r, payload, key)))
      } else {
        handleObjectResult(r, payload, key)
      }
    }
    if (unrecognized.length) {
      payload.issues.push({
        code: 'unrecognized_keys',
        keys: unrecognized,
        input,
        inst,
      })
    }
    if (!proms.length) return payload
    return Promise.all(proms).then(() => {
      return payload
    })
  }
})
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value
      return final
    }
  }
  final.issues.push({
    code: 'invalid_union',
    input: final.value,
    inst,
    errors: results.map((result) =>
      result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
    ),
  })
  return final
}
const $ZodUnion = /*@__PURE__*/ $constructor('$ZodUnion', (inst, def) => {
  $ZodType.init(inst, def)
  defineLazy(inst._zod, 'optin', () =>
    def.options.some((o) => o._zod.optin === 'optional')
      ? 'optional'
      : undefined
  )
  defineLazy(inst._zod, 'optout', () =>
    def.options.some((o) => o._zod.optout === 'optional')
      ? 'optional'
      : undefined
  )
  defineLazy(inst._zod, 'values', () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(
        def.options.flatMap((option) => Array.from(option._zod.values))
      )
    }
    return undefined
  })
  defineLazy(inst._zod, 'pattern', () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern)
      return new RegExp(
        `^(${patterns.map((p) => cleanRegex(p.source)).join('|')})$`
      )
    }
    return undefined
  })
  inst._zod.parse = (payload, ctx) => {
    let async = false
    const results = []
    for (const option of def.options) {
      const result = option._zod.run(
        {
          value: payload.value,
          issues: [],
        },
        ctx
      )
      if (result instanceof Promise) {
        results.push(result)
        async = true
      } else {
        if (result.issues.length === 0) return result
        results.push(result)
      }
    }
    if (!async) return handleUnionResults(results, payload, inst, ctx)
    return Promise.all(results).then((results) => {
      return handleUnionResults(results, payload, inst, ctx)
    })
  }
})
const $ZodDiscriminatedUnion =
  /*@__PURE__*/
  $constructor('$ZodDiscriminatedUnion', (inst, def) => {
    $ZodUnion.init(inst, def)
    const _super = inst._zod.parse
    defineLazy(inst._zod, 'propValues', () => {
      const propValues = {}
      for (const option of def.options) {
        const pv = option._zod.propValues
        if (!pv || Object.keys(pv).length === 0)
          throw new Error(
            `Invalid discriminated union option at index "${def.options.indexOf(option)}"`
          )
        for (const [k, v] of Object.entries(pv)) {
          if (!propValues[k]) propValues[k] = new Set()
          for (const val of v) {
            propValues[k].add(val)
          }
        }
      }
      return propValues
    })
    const disc = cached(() => {
      const opts = def.options
      const map = new Map()
      for (const o of opts) {
        const values = o._zod.propValues[def.discriminator]
        if (!values || values.size === 0)
          throw new Error(
            `Invalid discriminated union option at index "${def.options.indexOf(o)}"`
          )
        for (const v of values) {
          if (map.has(v)) {
            throw new Error(`Duplicate discriminator value "${String(v)}"`)
          }
          map.set(v, o)
        }
      }
      return map
    })
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value
      if (!isObject(input)) {
        payload.issues.push({
          code: 'invalid_type',
          expected: 'object',
          input,
          inst,
        })
        return payload
      }
      const opt = disc.value.get(input?.[def.discriminator])
      if (opt) {
        return opt._zod.run(payload, ctx)
      }
      if (def.unionFallback) {
        return _super(payload, ctx)
      }
      // no matching discriminator
      payload.issues.push({
        code: 'invalid_union',
        errors: [],
        note: 'No matching discriminator',
        input,
        path: [def.discriminator],
        inst,
      })
      return payload
    }
  })
const $ZodIntersection = /*@__PURE__*/ $constructor(
  '$ZodIntersection',
  (inst, def) => {
    $ZodType.init(inst, def)
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value
      const left = def.left._zod.run({ value: input, issues: [] }, ctx)
      const right = def.right._zod.run({ value: input, issues: [] }, ctx)
      const async = left instanceof Promise || right instanceof Promise
      if (async) {
        return Promise.all([left, right]).then(([left, right]) => {
          return handleIntersectionResults(payload, left, right)
        })
      }
      return handleIntersectionResults(payload, left, right)
    }
  }
)
function mergeValues(a, b) {
  // const aType = parse.t(a);
  // const bType = parse.t(b);
  if (a === b) {
    return { valid: true, data: a }
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a }
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b)
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1)
    const newObj = { ...a, ...b }
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key])
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
        }
      }
      newObj[key] = sharedValue.data
    }
    return { valid: true, data: newObj }
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] }
    }
    const newArray = []
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index]
      const itemB = b[index]
      const sharedValue = mergeValues(itemA, itemB)
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
        }
      }
      newArray.push(sharedValue.data)
    }
    return { valid: true, data: newArray }
  }
  return { valid: false, mergeErrorPath: [] }
}
function handleIntersectionResults(result, left, right) {
  if (left.issues.length) {
    result.issues.push(...left.issues)
  }
  if (right.issues.length) {
    result.issues.push(...right.issues)
  }
  if (aborted(result)) return result
  const merged = mergeValues(left.value, right.value)
  if (!merged.valid) {
    throw new Error(
      `Unmergable intersection. Error path: ` +
        `${JSON.stringify(merged.mergeErrorPath)}`
    )
  }
  result.value = merged.data
  return result
}
const $ZodEnum = /*@__PURE__*/ $constructor('$ZodEnum', (inst, def) => {
  $ZodType.init(inst, def)
  const values = getEnumValues(def.entries)
  inst._zod.values = new Set(values)
  inst._zod.pattern = new RegExp(
    `^(${values
      .filter((k) => propertyKeyTypes.has(typeof k))
      .map((o) => (typeof o === 'string' ? escapeRegex(o) : o.toString()))
      .join('|')})$`
  )
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value
    if (inst._zod.values.has(input)) {
      return payload
    }
    payload.issues.push({
      code: 'invalid_value',
      values,
      input,
      inst,
    })
    return payload
  }
})
const $ZodLiteral = /*@__PURE__*/ $constructor('$ZodLiteral', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.values = new Set(def.values)
  inst._zod.pattern = new RegExp(
    `^(${def.values
      .map((o) =>
        typeof o === 'string' ? escapeRegex(o) : o ? o.toString() : String(o)
      )
      .join('|')})$`
  )
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value
    if (inst._zod.values.has(input)) {
      return payload
    }
    payload.issues.push({
      code: 'invalid_value',
      values: def.values,
      input,
      inst,
    })
    return payload
  }
})
const $ZodTransform = /*@__PURE__*/ $constructor(
  '$ZodTransform',
  (inst, def) => {
    $ZodType.init(inst, def)
    inst._zod.parse = (payload, _ctx) => {
      const _out = def.transform(payload.value, payload)
      if (_ctx.async) {
        const output = _out instanceof Promise ? _out : Promise.resolve(_out)
        return output.then((output) => {
          payload.value = output
          return payload
        })
      }
      if (_out instanceof Promise) {
        throw new $ZodAsyncError()
      }
      payload.value = _out
      return payload
    }
  }
)
const $ZodOptional = /*@__PURE__*/ $constructor('$ZodOptional', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.optin = 'optional'
  inst._zod.optout = 'optional'
  defineLazy(inst._zod, 'values', () => {
    return def.innerType._zod.values
      ? new Set([...def.innerType._zod.values, undefined])
      : undefined
  })
  defineLazy(inst._zod, 'pattern', () => {
    const pattern = def.innerType._zod.pattern
    return pattern
      ? new RegExp(`^(${cleanRegex(pattern.source)})?$`)
      : undefined
  })
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === 'optional') {
      return def.innerType._zod.run(payload, ctx)
    }
    if (payload.value === undefined) {
      return payload
    }
    return def.innerType._zod.run(payload, ctx)
  }
})
const $ZodNullable = /*@__PURE__*/ $constructor('$ZodNullable', (inst, def) => {
  $ZodType.init(inst, def)
  defineLazy(inst._zod, 'optin', () => def.innerType._zod.optin)
  defineLazy(inst._zod, 'optout', () => def.innerType._zod.optout)
  defineLazy(inst._zod, 'pattern', () => {
    const pattern = def.innerType._zod.pattern
    return pattern
      ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`)
      : undefined
  })
  defineLazy(inst._zod, 'values', () => {
    return def.innerType._zod.values
      ? new Set([...def.innerType._zod.values, null])
      : undefined
  })
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null) return payload
    return def.innerType._zod.run(payload, ctx)
  }
})
const $ZodDefault = /*@__PURE__*/ $constructor('$ZodDefault', (inst, def) => {
  $ZodType.init(inst, def)
  // inst._zod.qin = "true";
  inst._zod.optin = 'optional'
  defineLazy(inst._zod, 'values', () => def.innerType._zod.values)
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === undefined) {
      payload.value = def.defaultValue
      /**
       * $ZodDefault always returns the default value immediately.
       * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
      return payload
    }
    const result = def.innerType._zod.run(payload, ctx)
    if (result instanceof Promise) {
      return result.then((result) => handleDefaultResult(result, def))
    }
    return handleDefaultResult(result, def)
  }
})
function handleDefaultResult(payload, def) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue
  }
  return payload
}
const $ZodPrefault = /*@__PURE__*/ $constructor('$ZodPrefault', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.optin = 'optional'
  defineLazy(inst._zod, 'values', () => def.innerType._zod.values)
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === undefined) {
      payload.value = def.defaultValue
    }
    return def.innerType._zod.run(payload, ctx)
  }
})
const $ZodNonOptional = /*@__PURE__*/ $constructor(
  '$ZodNonOptional',
  (inst, def) => {
    $ZodType.init(inst, def)
    defineLazy(inst._zod, 'values', () => {
      const v = def.innerType._zod.values
      return v ? new Set([...v].filter((x) => x !== undefined)) : undefined
    })
    inst._zod.parse = (payload, ctx) => {
      const result = def.innerType._zod.run(payload, ctx)
      if (result instanceof Promise) {
        return result.then((result) => handleNonOptionalResult(result, inst))
      }
      return handleNonOptionalResult(result, inst)
    }
  }
)
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === undefined) {
    payload.issues.push({
      code: 'invalid_type',
      expected: 'nonoptional',
      input: payload.value,
      inst,
    })
  }
  return payload
}
const $ZodCatch = /*@__PURE__*/ $constructor('$ZodCatch', (inst, def) => {
  $ZodType.init(inst, def)
  inst._zod.optin = 'optional'
  defineLazy(inst._zod, 'optout', () => def.innerType._zod.optout)
  defineLazy(inst._zod, 'values', () => def.innerType._zod.values)
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx)
    if (result instanceof Promise) {
      return result.then((result) => {
        payload.value = result.value
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result.issues.map((iss) =>
                finalizeIssue(iss, ctx, config())
              ),
            },
            input: payload.value,
          })
          payload.issues = []
        }
        return payload
      })
    }
    payload.value = result.value
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
        },
        input: payload.value,
      })
      payload.issues = []
    }
    return payload
  }
})
const $ZodPipe = /*@__PURE__*/ $constructor('$ZodPipe', (inst, def) => {
  $ZodType.init(inst, def)
  defineLazy(inst._zod, 'values', () => def.in._zod.values)
  defineLazy(inst._zod, 'optin', () => def.in._zod.optin)
  defineLazy(inst._zod, 'optout', () => def.out._zod.optout)
  inst._zod.parse = (payload, ctx) => {
    const left = def.in._zod.run(payload, ctx)
    if (left instanceof Promise) {
      return left.then((left) => handlePipeResult(left, def, ctx))
    }
    return handlePipeResult(left, def, ctx)
  }
})
function handlePipeResult(left, def, ctx) {
  if (aborted(left)) {
    return left
  }
  return def.out._zod.run({ value: left.value, issues: left.issues }, ctx)
}
const $ZodReadonly = /*@__PURE__*/ $constructor('$ZodReadonly', (inst, def) => {
  $ZodType.init(inst, def)
  defineLazy(inst._zod, 'propValues', () => def.innerType._zod.propValues)
  defineLazy(inst._zod, 'values', () => def.innerType._zod.values)
  defineLazy(inst._zod, 'optin', () => def.innerType._zod.optin)
  defineLazy(inst._zod, 'optout', () => def.innerType._zod.optout)
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx)
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult)
    }
    return handleReadonlyResult(result)
  }
})
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value)
  return payload
}
const $ZodLazy = /*@__PURE__*/ $constructor('$ZodLazy', (inst, def) => {
  $ZodType.init(inst, def)
  defineLazy(inst._zod, 'innerType', () => def.getter())
  defineLazy(inst._zod, 'pattern', () => inst._zod.innerType._zod.pattern)
  defineLazy(inst._zod, 'propValues', () => inst._zod.innerType._zod.propValues)
  defineLazy(inst._zod, 'optin', () => inst._zod.innerType._zod.optin)
  defineLazy(inst._zod, 'optout', () => inst._zod.innerType._zod.optout)
  inst._zod.parse = (payload, ctx) => {
    const inner = inst._zod.innerType
    return inner._zod.run(payload, ctx)
  }
})
const $ZodCustom = /*@__PURE__*/ $constructor('$ZodCustom', (inst, def) => {
  $ZodCheck.init(inst, def)
  $ZodType.init(inst, def)
  inst._zod.parse = (payload, _) => {
    return payload
  }
  inst._zod.check = (payload) => {
    const input = payload.value
    const r = def.fn(input)
    if (r instanceof Promise) {
      return r.then((r) => handleRefineResult(r, payload, input, inst))
    }
    handleRefineResult(r, payload, input, inst)
    return
  }
})
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: 'custom',
      input,
      inst, // incorporates params.error into issue reporting
      path: [...(inst._zod.def.path ?? [])], // incorporates params.error into issue reporting
      continue: !inst._zod.def.abort,
      // params: inst._zod.def.params,
    }
    if (inst._zod.def.params) _iss.params = inst._zod.def.params
    payload.issues.push(issue(_iss))
  }
}

class $ZodRegistry {
  constructor() {
    this._map = new Map()
    this._idmap = new Map()
  }
  add(schema, ..._meta) {
    const meta = _meta[0]
    this._map.set(schema, meta)
    if (meta && typeof meta === 'object' && 'id' in meta) {
      if (this._idmap.has(meta.id)) {
        throw new Error(`ID ${meta.id} already exists in the registry`)
      }
      this._idmap.set(meta.id, schema)
    }
    return this
  }
  clear() {
    this._map = new Map()
    this._idmap = new Map()
    return this
  }
  remove(schema) {
    const meta = this._map.get(schema)
    if (meta && typeof meta === 'object' && 'id' in meta) {
      this._idmap.delete(meta.id)
    }
    this._map.delete(schema)
    return this
  }
  get(schema) {
    // return this._map.get(schema) as any;
    // inherit metadata
    const p = schema._zod.parent
    if (p) {
      const pm = { ...(this.get(p) ?? {}) }
      delete pm.id // do not inherit id
      return { ...pm, ...this._map.get(schema) }
    }
    return this._map.get(schema)
  }
  has(schema) {
    return this._map.has(schema)
  }
}
// registries
function registry() {
  return new $ZodRegistry()
}
const globalRegistry = /*@__PURE__*/ registry()

function _string(Class, params) {
  return new Class({
    type: 'string',
    ...normalizeParams(params),
  })
}
function _email(Class, params) {
  return new Class({
    type: 'string',
    format: 'email',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _guid(Class, params) {
  return new Class({
    type: 'string',
    format: 'guid',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _uuid(Class, params) {
  return new Class({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _uuidv4(Class, params) {
  return new Class({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: false,
    version: 'v4',
    ...normalizeParams(params),
  })
}
function _uuidv6(Class, params) {
  return new Class({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: false,
    version: 'v6',
    ...normalizeParams(params),
  })
}
function _uuidv7(Class, params) {
  return new Class({
    type: 'string',
    format: 'uuid',
    check: 'string_format',
    abort: false,
    version: 'v7',
    ...normalizeParams(params),
  })
}
function _url(Class, params) {
  return new Class({
    type: 'string',
    format: 'url',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _emoji(Class, params) {
  return new Class({
    type: 'string',
    format: 'emoji',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _nanoid(Class, params) {
  return new Class({
    type: 'string',
    format: 'nanoid',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _cuid(Class, params) {
  return new Class({
    type: 'string',
    format: 'cuid',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _cuid2(Class, params) {
  return new Class({
    type: 'string',
    format: 'cuid2',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _ulid(Class, params) {
  return new Class({
    type: 'string',
    format: 'ulid',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _xid(Class, params) {
  return new Class({
    type: 'string',
    format: 'xid',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _ksuid(Class, params) {
  return new Class({
    type: 'string',
    format: 'ksuid',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _ipv4(Class, params) {
  return new Class({
    type: 'string',
    format: 'ipv4',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _ipv6(Class, params) {
  return new Class({
    type: 'string',
    format: 'ipv6',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _cidrv4(Class, params) {
  return new Class({
    type: 'string',
    format: 'cidrv4',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _cidrv6(Class, params) {
  return new Class({
    type: 'string',
    format: 'cidrv6',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _base64(Class, params) {
  return new Class({
    type: 'string',
    format: 'base64',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _base64url(Class, params) {
  return new Class({
    type: 'string',
    format: 'base64url',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _e164(Class, params) {
  return new Class({
    type: 'string',
    format: 'e164',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _jwt(Class, params) {
  return new Class({
    type: 'string',
    format: 'jwt',
    check: 'string_format',
    abort: false,
    ...normalizeParams(params),
  })
}
function _isoDateTime(Class, params) {
  return new Class({
    type: 'string',
    format: 'datetime',
    check: 'string_format',
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params),
  })
}
function _isoDate(Class, params) {
  return new Class({
    type: 'string',
    format: 'date',
    check: 'string_format',
    ...normalizeParams(params),
  })
}
function _isoTime(Class, params) {
  return new Class({
    type: 'string',
    format: 'time',
    check: 'string_format',
    precision: null,
    ...normalizeParams(params),
  })
}
function _isoDuration(Class, params) {
  return new Class({
    type: 'string',
    format: 'duration',
    check: 'string_format',
    ...normalizeParams(params),
  })
}
function _boolean(Class, params) {
  return new Class({
    type: 'boolean',
    ...normalizeParams(params),
  })
}
function _unknown(Class) {
  return new Class({
    type: 'unknown',
  })
}
function _never(Class, params) {
  return new Class({
    type: 'never',
    ...normalizeParams(params),
  })
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: 'max_length',
    ...normalizeParams(params),
    maximum,
  })
  return ch
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: 'min_length',
    ...normalizeParams(params),
    minimum,
  })
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: 'length_equals',
    ...normalizeParams(params),
    length,
  })
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: 'string_format',
    format: 'regex',
    ...normalizeParams(params),
    pattern,
  })
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: 'string_format',
    format: 'lowercase',
    ...normalizeParams(params),
  })
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: 'string_format',
    format: 'uppercase',
    ...normalizeParams(params),
  })
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: 'string_format',
    format: 'includes',
    ...normalizeParams(params),
    includes,
  })
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: 'string_format',
    format: 'starts_with',
    ...normalizeParams(params),
    prefix,
  })
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: 'string_format',
    format: 'ends_with',
    ...normalizeParams(params),
    suffix,
  })
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: 'overwrite',
    tx,
  })
}
// normalize
function _normalize(form) {
  return _overwrite((input) => input.normalize(form))
}
// trim
function _trim() {
  return _overwrite((input) => input.trim())
}
// toLowerCase
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase())
}
// toUpperCase
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase())
}
function _array(Class, element, params) {
  return new Class({
    type: 'array',
    element,
    // get element() {
    //   return element;
    // },
    ...normalizeParams(params),
  })
}
// export function _refine<T>(
//   Class: util.SchemaClass<schemas.$ZodCustom>,
//   fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>,
//   _params: string | $ZodCustomParams = {}
// ): checks.$ZodCheck<T> {
//   return _custom(Class, fn, _params);
// }
// same as _custom but defaults to abort:false
function _refine(Class, fn, _params) {
  const schema = new Class({
    type: 'custom',
    check: 'custom',
    fn: fn,
    ...normalizeParams(_params),
  })
  return schema
}

const ZodISODateTime = /*@__PURE__*/ $constructor(
  'ZodISODateTime',
  (inst, def) => {
    $ZodISODateTime.init(inst, def)
    ZodStringFormat.init(inst, def)
  }
)
function datetime(params) {
  return _isoDateTime(ZodISODateTime, params)
}
const ZodISODate = /*@__PURE__*/ $constructor('ZodISODate', (inst, def) => {
  $ZodISODate.init(inst, def)
  ZodStringFormat.init(inst, def)
})
function date(params) {
  return _isoDate(ZodISODate, params)
}
const ZodISOTime = /*@__PURE__*/ $constructor('ZodISOTime', (inst, def) => {
  $ZodISOTime.init(inst, def)
  ZodStringFormat.init(inst, def)
})
function time(params) {
  return _isoTime(ZodISOTime, params)
}
const ZodISODuration = /*@__PURE__*/ $constructor(
  'ZodISODuration',
  (inst, def) => {
    $ZodISODuration.init(inst, def)
    ZodStringFormat.init(inst, def)
  }
)
function duration(params) {
  return _isoDuration(ZodISODuration, params)
}

const initializer = (inst, issues) => {
  $ZodError.init(inst, issues)
  inst.name = 'ZodError'
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper),
      // enumerable: false,
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper),
      // enumerable: false,
    },
    addIssue: {
      value: (issue) => inst.issues.push(issue),
      // enumerable: false,
    },
    addIssues: {
      value: (issues) => inst.issues.push(...issues),
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0
      },
      // enumerable: false,
    },
  })
  // Object.defineProperty(inst, "isEmpty", {
  //   get() {
  //     return inst.issues.length === 0;
  //   },
  // });
}
const ZodRealError = $constructor('ZodError', initializer, {
  Parent: Error,
})
// /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
// export type ErrorMapCtx = core.$ZodErrorMapCtx;

const parse = /* @__PURE__ */ _parse(ZodRealError)
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError)
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError)
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError)

const ZodType = /*@__PURE__*/ $constructor('ZodType', (inst, def) => {
  $ZodType.init(inst, def)
  inst.def = def
  Object.defineProperty(inst, '_def', { value: def })
  // base methods
  inst.check = (...checks) => {
    return inst.clone(
      {
        ...def,
        checks: [
          ...(def.checks ?? []),
          ...checks.map((ch) =>
            typeof ch === 'function'
              ? { _zod: { check: ch, def: { check: 'custom' }, onattach: [] } }
              : ch
          ),
        ],
      }
      // { parent: true }
    )
  }
  inst.clone = (def, params) => clone(inst, def, params)
  inst.brand = () => inst
  inst.register = (reg, meta) => {
    reg.add(inst, meta)
    return inst
  }
  // parsing
  inst.parse = (data, params) =>
    parse(inst, data, params, { callee: inst.parse })
  inst.safeParse = (data, params) => safeParse(inst, data, params)
  inst.parseAsync = async (data, params) =>
    parseAsync(inst, data, params, { callee: inst.parseAsync })
  inst.safeParseAsync = async (data, params) =>
    safeParseAsync(inst, data, params)
  inst.spa = inst.safeParseAsync
  // refinements
  inst.refine = (check, params) => inst.check(refine(check, params))
  inst.superRefine = (refinement) => inst.check(superRefine(refinement))
  inst.overwrite = (fn) => inst.check(_overwrite(fn))
  // wrappers
  inst.optional = () => optional(inst)
  inst.nullable = () => nullable(inst)
  inst.nullish = () => optional(nullable(inst))
  inst.nonoptional = (params) => nonoptional(inst, params)
  inst.array = () => array(inst)
  inst.or = (arg) => union([inst, arg])
  inst.and = (arg) => intersection(inst, arg)
  inst.transform = (tx) => pipe(inst, transform(tx))
  inst.default = (def) => _default(inst, def)
  inst.prefault = (def) => prefault(inst, def)
  // inst.coalesce = (def, params) => coalesce(inst, def, params);
  inst.catch = (params) => _catch(inst, params)
  inst.pipe = (target) => pipe(inst, target)
  inst.readonly = () => readonly(inst)
  // meta
  inst.describe = (description) => {
    const cl = inst.clone()
    globalRegistry.add(cl, { description })
    return cl
  }
  Object.defineProperty(inst, 'description', {
    get() {
      return globalRegistry.get(inst)?.description
    },
    configurable: true,
  })
  inst.meta = (...args) => {
    if (args.length === 0) {
      return globalRegistry.get(inst)
    }
    const cl = inst.clone()
    globalRegistry.add(cl, args[0])
    return cl
  }
  // helpers
  inst.isOptional = () => inst.safeParse(undefined).success
  inst.isNullable = () => inst.safeParse(null).success
  return inst
})
/** @internal */
const _ZodString = /*@__PURE__*/ $constructor('_ZodString', (inst, def) => {
  $ZodString.init(inst, def)
  ZodType.init(inst, def)
  const bag = inst._zod.bag
  inst.format = bag.format ?? null
  inst.minLength = bag.minimum ?? null
  inst.maxLength = bag.maximum ?? null
  // validations
  inst.regex = (...args) => inst.check(_regex(...args))
  inst.includes = (...args) => inst.check(_includes(...args))
  inst.startsWith = (...args) => inst.check(_startsWith(...args))
  inst.endsWith = (...args) => inst.check(_endsWith(...args))
  inst.min = (...args) => inst.check(_minLength(...args))
  inst.max = (...args) => inst.check(_maxLength(...args))
  inst.length = (...args) => inst.check(_length(...args))
  inst.nonempty = (...args) => inst.check(_minLength(1, ...args))
  inst.lowercase = (params) => inst.check(_lowercase(params))
  inst.uppercase = (params) => inst.check(_uppercase(params))
  // transforms
  inst.trim = () => inst.check(_trim())
  inst.normalize = (...args) => inst.check(_normalize(...args))
  inst.toLowerCase = () => inst.check(_toLowerCase())
  inst.toUpperCase = () => inst.check(_toUpperCase())
})
const ZodString = /*@__PURE__*/ $constructor('ZodString', (inst, def) => {
  $ZodString.init(inst, def)
  _ZodString.init(inst, def)
  inst.email = (params) => inst.check(_email(ZodEmail, params))
  inst.url = (params) => inst.check(_url(ZodURL, params))
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params))
  inst.emoji = (params) => inst.check(_emoji(ZodEmoji, params))
  inst.guid = (params) => inst.check(_guid(ZodGUID, params))
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params))
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params))
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params))
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params))
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params))
  inst.guid = (params) => inst.check(_guid(ZodGUID, params))
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params))
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params))
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params))
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params))
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params))
  inst.xid = (params) => inst.check(_xid(ZodXID, params))
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params))
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params))
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params))
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params))
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params))
  inst.e164 = (params) => inst.check(_e164(ZodE164, params))
  // iso
  inst.datetime = (params) => inst.check(datetime(params))
  inst.date = (params) => inst.check(date(params))
  inst.time = (params) => inst.check(time(params))
  inst.duration = (params) => inst.check(duration(params))
})
function string(params) {
  return _string(ZodString, params)
}
const ZodStringFormat = /*@__PURE__*/ $constructor(
  'ZodStringFormat',
  (inst, def) => {
    $ZodStringFormat.init(inst, def)
    _ZodString.init(inst, def)
  }
)
const ZodEmail = /*@__PURE__*/ $constructor('ZodEmail', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodEmail.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodGUID = /*@__PURE__*/ $constructor('ZodGUID', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodGUID.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodUUID = /*@__PURE__*/ $constructor('ZodUUID', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodUUID.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodURL = /*@__PURE__*/ $constructor('ZodURL', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodURL.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodEmoji = /*@__PURE__*/ $constructor('ZodEmoji', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodEmoji.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodNanoID = /*@__PURE__*/ $constructor('ZodNanoID', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodNanoID.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodCUID = /*@__PURE__*/ $constructor('ZodCUID', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodCUID.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodCUID2 = /*@__PURE__*/ $constructor('ZodCUID2', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodCUID2.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodULID = /*@__PURE__*/ $constructor('ZodULID', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodULID.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodXID = /*@__PURE__*/ $constructor('ZodXID', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodXID.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodKSUID = /*@__PURE__*/ $constructor('ZodKSUID', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodKSUID.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodIPv4 = /*@__PURE__*/ $constructor('ZodIPv4', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodIPv4.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodIPv6 = /*@__PURE__*/ $constructor('ZodIPv6', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodIPv6.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodCIDRv4 = /*@__PURE__*/ $constructor('ZodCIDRv4', (inst, def) => {
  $ZodCIDRv4.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodCIDRv6 = /*@__PURE__*/ $constructor('ZodCIDRv6', (inst, def) => {
  $ZodCIDRv6.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodBase64 = /*@__PURE__*/ $constructor('ZodBase64', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodBase64.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodBase64URL = /*@__PURE__*/ $constructor('ZodBase64URL', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodBase64URL.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodE164 = /*@__PURE__*/ $constructor('ZodE164', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodE164.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodJWT = /*@__PURE__*/ $constructor('ZodJWT', (inst, def) => {
  // ZodStringFormat.init(inst, def);
  $ZodJWT.init(inst, def)
  ZodStringFormat.init(inst, def)
})
const ZodBoolean = /*@__PURE__*/ $constructor('ZodBoolean', (inst, def) => {
  $ZodBoolean.init(inst, def)
  ZodType.init(inst, def)
})
function boolean(params) {
  return _boolean(ZodBoolean, params)
}
const ZodUnknown = /*@__PURE__*/ $constructor('ZodUnknown', (inst, def) => {
  $ZodUnknown.init(inst, def)
  ZodType.init(inst, def)
})
function unknown() {
  return _unknown(ZodUnknown)
}
const ZodNever = /*@__PURE__*/ $constructor('ZodNever', (inst, def) => {
  $ZodNever.init(inst, def)
  ZodType.init(inst, def)
})
function never(params) {
  return _never(ZodNever, params)
}
const ZodArray = /*@__PURE__*/ $constructor('ZodArray', (inst, def) => {
  $ZodArray.init(inst, def)
  ZodType.init(inst, def)
  inst.element = def.element
  inst.min = (minLength, params) => inst.check(_minLength(minLength, params))
  inst.nonempty = (params) => inst.check(_minLength(1, params))
  inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params))
  inst.length = (len, params) => inst.check(_length(len, params))
  inst.unwrap = () => inst.element
})
function array(element, params) {
  return _array(ZodArray, element, params)
}
const ZodObject = /*@__PURE__*/ $constructor('ZodObject', (inst, def) => {
  $ZodObject.init(inst, def)
  ZodType.init(inst, def)
  defineLazy(inst, 'shape', () => def.shape)
  inst.keyof = () => _enum(Object.keys(inst._zod.def.shape))
  inst.catchall = (catchall) =>
    inst.clone({ ...inst._zod.def, catchall: catchall })
  inst.passthrough = () => inst.clone({ ...inst._zod.def, catchall: unknown() })
  // inst.nonstrict = () => inst.clone({ ...inst._zod.def, catchall: api.unknown() });
  inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() })
  inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() })
  inst.strip = () => inst.clone({ ...inst._zod.def, catchall: undefined })
  inst.extend = (incoming) => {
    return extend(inst, incoming)
  }
  inst.merge = (other) => merge(inst, other)
  inst.pick = (mask) => pick(inst, mask)
  inst.omit = (mask) => omit(inst, mask)
  inst.partial = (...args) => partial(ZodOptional, inst, args[0])
  inst.required = (...args) => required(ZodNonOptional, inst, args[0])
})
function object(shape, params) {
  const def = {
    type: 'object',
    get shape() {
      assignProp(this, 'shape', { ...shape })
      return this.shape
    },
    ...normalizeParams(params),
  }
  return new ZodObject(def)
}
const ZodUnion = /*@__PURE__*/ $constructor('ZodUnion', (inst, def) => {
  $ZodUnion.init(inst, def)
  ZodType.init(inst, def)
  inst.options = def.options
})
function union(options, params) {
  return new ZodUnion({
    type: 'union',
    options: options,
    ...normalizeParams(params),
  })
}
const ZodDiscriminatedUnion = /*@__PURE__*/ $constructor(
  'ZodDiscriminatedUnion',
  (inst, def) => {
    ZodUnion.init(inst, def)
    $ZodDiscriminatedUnion.init(inst, def)
  }
)
function discriminatedUnion(discriminator, options, params) {
  // const [options, params] = args;
  return new ZodDiscriminatedUnion({
    type: 'union',
    options,
    discriminator,
    ...normalizeParams(params),
  })
}
const ZodIntersection = /*@__PURE__*/ $constructor(
  'ZodIntersection',
  (inst, def) => {
    $ZodIntersection.init(inst, def)
    ZodType.init(inst, def)
  }
)
function intersection(left, right) {
  return new ZodIntersection({
    type: 'intersection',
    left: left,
    right: right,
  })
}
const ZodEnum = /*@__PURE__*/ $constructor('ZodEnum', (inst, def) => {
  $ZodEnum.init(inst, def)
  ZodType.init(inst, def)
  inst.enum = def.entries
  inst.options = Object.values(def.entries)
  const keys = new Set(Object.keys(def.entries))
  inst.extract = (values, params) => {
    const newEntries = {}
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value]
      } else throw new Error(`Key ${value} not found in enum`)
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries,
    })
  }
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries }
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value]
      } else throw new Error(`Key ${value} not found in enum`)
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries,
    })
  }
})
function _enum(values, params) {
  const entries = Array.isArray(values)
    ? Object.fromEntries(values.map((v) => [v, v]))
    : values
  return new ZodEnum({
    type: 'enum',
    entries,
    ...normalizeParams(params),
  })
}
const ZodLiteral = /*@__PURE__*/ $constructor('ZodLiteral', (inst, def) => {
  $ZodLiteral.init(inst, def)
  ZodType.init(inst, def)
  inst.values = new Set(def.values)
  Object.defineProperty(inst, 'value', {
    get() {
      if (def.values.length > 1) {
        throw new Error(
          'This schema contains multiple valid literal values. Use `.values` instead.'
        )
      }
      return def.values[0]
    },
  })
})
function literal(value, params) {
  return new ZodLiteral({
    type: 'literal',
    values: Array.isArray(value) ? value : [value],
    ...normalizeParams(params),
  })
}
const ZodTransform = /*@__PURE__*/ $constructor('ZodTransform', (inst, def) => {
  $ZodTransform.init(inst, def)
  ZodType.init(inst, def)
  inst._zod.parse = (payload, _ctx) => {
    payload.addIssue = (issue$1) => {
      if (typeof issue$1 === 'string') {
        payload.issues.push(issue(issue$1, payload.value, def))
      } else {
        // for Zod 3 backwards compatibility
        const _issue = issue$1
        if (_issue.fatal) _issue.continue = false
        _issue.code ?? (_issue.code = 'custom')
        _issue.input ?? (_issue.input = payload.value)
        _issue.inst ?? (_issue.inst = inst)
        _issue.continue ?? (_issue.continue = true)
        payload.issues.push(issue(_issue))
      }
    }
    const output = def.transform(payload.value, payload)
    if (output instanceof Promise) {
      return output.then((output) => {
        payload.value = output
        return payload
      })
    }
    payload.value = output
    return payload
  }
})
function transform(fn) {
  return new ZodTransform({
    type: 'transform',
    transform: fn,
  })
}
const ZodOptional = /*@__PURE__*/ $constructor('ZodOptional', (inst, def) => {
  $ZodOptional.init(inst, def)
  ZodType.init(inst, def)
  inst.unwrap = () => inst._zod.def.innerType
})
function optional(innerType) {
  return new ZodOptional({
    type: 'optional',
    innerType: innerType,
  })
}
const ZodNullable = /*@__PURE__*/ $constructor('ZodNullable', (inst, def) => {
  $ZodNullable.init(inst, def)
  ZodType.init(inst, def)
  inst.unwrap = () => inst._zod.def.innerType
})
function nullable(innerType) {
  return new ZodNullable({
    type: 'nullable',
    innerType: innerType,
  })
}
const ZodDefault = /*@__PURE__*/ $constructor('ZodDefault', (inst, def) => {
  $ZodDefault.init(inst, def)
  ZodType.init(inst, def)
  inst.unwrap = () => inst._zod.def.innerType
  inst.removeDefault = inst.unwrap
})
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: 'default',
    innerType: innerType,
    get defaultValue() {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue
    },
  })
}
const ZodPrefault = /*@__PURE__*/ $constructor('ZodPrefault', (inst, def) => {
  $ZodPrefault.init(inst, def)
  ZodType.init(inst, def)
  inst.unwrap = () => inst._zod.def.innerType
})
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: 'prefault',
    innerType: innerType,
    get defaultValue() {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue
    },
  })
}
const ZodNonOptional = /*@__PURE__*/ $constructor(
  'ZodNonOptional',
  (inst, def) => {
    $ZodNonOptional.init(inst, def)
    ZodType.init(inst, def)
    inst.unwrap = () => inst._zod.def.innerType
  }
)
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: 'nonoptional',
    innerType: innerType,
    ...normalizeParams(params),
  })
}
const ZodCatch = /*@__PURE__*/ $constructor('ZodCatch', (inst, def) => {
  $ZodCatch.init(inst, def)
  ZodType.init(inst, def)
  inst.unwrap = () => inst._zod.def.innerType
  inst.removeCatch = inst.unwrap
})
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: 'catch',
    innerType: innerType,
    catchValue:
      typeof catchValue === 'function' ? catchValue : () => catchValue,
  })
}
const ZodPipe = /*@__PURE__*/ $constructor('ZodPipe', (inst, def) => {
  $ZodPipe.init(inst, def)
  ZodType.init(inst, def)
  inst.in = def.in
  inst.out = def.out
})
function pipe(in_, out) {
  return new ZodPipe({
    type: 'pipe',
    in: in_,
    out: out,
    // ...util.normalizeParams(params),
  })
}
const ZodReadonly = /*@__PURE__*/ $constructor('ZodReadonly', (inst, def) => {
  $ZodReadonly.init(inst, def)
  ZodType.init(inst, def)
})
function readonly(innerType) {
  return new ZodReadonly({
    type: 'readonly',
    innerType: innerType,
  })
}
const ZodLazy = /*@__PURE__*/ $constructor('ZodLazy', (inst, def) => {
  $ZodLazy.init(inst, def)
  ZodType.init(inst, def)
  inst.unwrap = () => inst._zod.def.getter()
})
function lazy(getter) {
  return new ZodLazy({
    type: 'lazy',
    getter: getter,
  })
}
const ZodCustom = /*@__PURE__*/ $constructor('ZodCustom', (inst, def) => {
  $ZodCustom.init(inst, def)
  ZodType.init(inst, def)
})
// custom checks
function check(fn) {
  const ch = new $ZodCheck({
    check: 'custom',
    // ...util.normalizeParams(params),
  })
  ch._zod.check = fn
  return ch
}
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params)
}
// superRefine
function superRefine(fn) {
  const ch = check((payload) => {
    payload.addIssue = (issue$1) => {
      if (typeof issue$1 === 'string') {
        payload.issues.push(issue(issue$1, payload.value, ch._zod.def))
      } else {
        // for Zod 3 backwards compatibility
        const _issue = issue$1
        if (_issue.fatal) _issue.continue = false
        _issue.code ?? (_issue.code = 'custom')
        _issue.input ?? (_issue.input = payload.value)
        _issue.inst ?? (_issue.inst = ch)
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort)
        payload.issues.push(issue(_issue))
      }
    }
    return fn(payload.value, payload)
  })
  return ch
}

const TextWithExactSchema = object({
  value: string().describe('The text to match against.'),
  exact: boolean()
    .optional()
    .describe(
      'When true, the match is case-sensitive and must be a full string match. When false or omitted, the match is case-insensitive and allows substring matches.'
    ),
})
const CssNodeSelectorSchema = object({
  type: literal('css'),
  selector: string().describe(
    'A CSS selector string (e.g. "#login-button", "input[name=\\"email\\"]"). Use this only as a last resort when no semantic selector (role, label, text, etc.) can identify the element.'
  ),
}).describe('Select an element using a CSS selector.')
const GetByRoleNodeSelectorSchema = object({
  type: literal('role'),
  role: string().describe(
    'The ARIA role of the element (e.g. "button", "textbox", "link", "heading", "checkbox"). Refer to the accessibility tree to find the correct role.'
  ),
  name: TextWithExactSchema.optional().describe(
    'The accessible name of the element. Narrows the match when multiple elements share the same role.'
  ),
}).describe(
  'Select an element by its ARIA role and optionally its accessible name. This is the most robust selector type — prefer it whenever possible.'
)
const GetByAltTextNodeSelectorSchema = object({
  type: literal('alt'),
  text: TextWithExactSchema.describe(
    'The alt text of the image or area element.'
  ),
}).describe('Select an image or area element by its alt text.')
const GetByLabelNodeSelectorSchema = object({
  type: literal('label'),
  text: TextWithExactSchema.describe(
    'The text of the associated <label> element, or the value of the aria-label attribute.'
  ),
}).describe(
  'Select a form control by the text of its associated label. Works for <label> elements, aria-label, and aria-labelledby.'
)
const GetByPlaceholderNodeSelectorSchema = object({
  type: literal('placeholder'),
  text: TextWithExactSchema.describe(
    'The placeholder text of the input or textarea.'
  ),
}).describe('Select an input or textarea by its placeholder text.')
const GetByTextNodeSelectorSchema = object({
  type: literal('text'),
  text: TextWithExactSchema.describe(
    'The visible text content of the element.'
  ),
}).describe(
  'Select an element by its visible text content. Useful for links, paragraphs, and other non-form elements.'
)
const GetByTitleNodeSelectorSchema = object({
  type: literal('title'),
  text: TextWithExactSchema.describe('The value of the title attribute.'),
}).describe('Select an element by its title attribute.')
const GetByTestIdNodeSelectorSchema = object({
  type: literal('test-id'),
  testId: string().describe(
    'The value of the data-testid attribute on the element.'
  ),
}).describe(
  'Select an element by its data-testid attribute. Use only when the application explicitly provides test IDs.'
)
const NodeSelectorSchema = discriminatedUnion('type', [
  CssNodeSelectorSchema,
  GetByRoleNodeSelectorSchema,
  GetByAltTextNodeSelectorSchema,
  GetByLabelNodeSelectorSchema,
  GetByPlaceholderNodeSelectorSchema,
  GetByTextNodeSelectorSchema,
  GetByTitleNodeSelectorSchema,
  GetByTestIdNodeSelectorSchema,
]).describe(
  'Identifies a single element on the page. Prefer "role" selectors for robustness, then "label", "placeholder", "text", "alt", "title", or "test-id". Fall back to "css" only when no semantic selector works.'
)

const DriverCommandBaseSchema = object({
  id: string(),
})
const DriverResultBaseSchema = object({
  ok: literal(true),
  id: string(),
})
const DriverErrorSchema = object({
  ok: literal(false),
  id: string(),
  type: literal('error'),
  error: object({
    message: string(),
  }),
})
const GoToCommandSchema = DriverCommandBaseSchema.extend({
  type: literal('goTo'),
  url: string(),
})
const ClickCommandSchema = DriverCommandBaseSchema.extend({
  type: literal('click'),
  selector: NodeSelectorSchema,
})
const FillCommandSchema = DriverCommandBaseSchema.extend({
  type: literal('fill'),
  selector: NodeSelectorSchema,
  value: string(),
})
const GetAccessibilityTreeCommandSchema = DriverCommandBaseSchema.extend({
  type: literal('getAccessibilityTree'),
})
const AccessibilityNodeSchema = object({
  role: string(),
  name: string(),
  description: string(),
  children: lazy(() => AccessibilityNodeSchema.array()),
})
const GoToResultSchema = discriminatedUnion('ok', [
  DriverResultBaseSchema.extend({
    type: literal('goTo'),
  }),
  DriverErrorSchema,
])
const ClickResultSchema = discriminatedUnion('ok', [
  DriverResultBaseSchema.extend({
    type: literal('click'),
  }),
  DriverErrorSchema,
])
const FillResultSchema = discriminatedUnion('ok', [
  DriverResultBaseSchema.extend({
    type: literal('fill'),
  }),
  DriverErrorSchema,
])
const GetAccessibilityTreeResultSchema = discriminatedUnion('ok', [
  DriverResultBaseSchema.extend({
    type: literal('getAccessibilityTree'),
    tree: AccessibilityNodeSchema.nullable(),
  }),
  DriverErrorSchema,
])
const DriverCommandSchema = discriminatedUnion('type', [
  GoToCommandSchema,
  ClickCommandSchema,
  FillCommandSchema,
  GetAccessibilityTreeCommandSchema,
])
discriminatedUnion('type', [
  GoToResultSchema,
  ClickResultSchema,
  FillResultSchema,
  GetAccessibilityTreeResultSchema,
  DriverErrorSchema,
])

function resolveLocator(page, selector) {
  switch (selector.type) {
    case 'css':
      return page.locator(selector.selector)
    case 'role':
      return page.getByRole(selector.role, {
        name: selector.name?.value,
        exact: selector.name?.exact,
      })
    case 'alt':
      return page.getByAltText(selector.text.value, {
        exact: selector.text.exact,
      })
    case 'label':
      return page.getByLabel(selector.text.value, {
        exact: selector.text.exact,
      })
    case 'placeholder':
      return page.getByPlaceholder(selector.text.value, {
        exact: selector.text.exact,
      })
    case 'text':
      return page.getByText(selector.text.value, {
        exact: selector.text.exact,
      })
    case 'title':
      return page.getByTitle(selector.text.value, {
        exact: selector.text.exact,
      })
    case 'test-id':
      return page.getByTestId(selector.testId)
  }
}
if (__ENV.ACCESSIBILITY_SCRIPT === void 0) {
  throw new Error('ACCESSIBILITY_SCRIPT environment variable is required')
}
const accessibilityScript = open(__ENV.ACCESSIBILITY_SCRIPT)
console.log('accessibilityScript', accessibilityScript)
const options = {
  scenarios: {
    default: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
    },
  },
}
function getTextMessage(data) {
  if (typeof data === 'string') {
    return data
  }
  return null
}
async function handle(page, command) {
  switch (command.type) {
    case 'goTo': {
      await page.goto(command.url)
      return {
        ok: true,
        id: command.id,
        type: 'goTo',
      }
    }
    case 'click': {
      await resolveLocator(page, command.selector).click()
      return {
        ok: true,
        id: command.id,
        type: 'click',
      }
    }
    case 'fill': {
      await resolveLocator(page, command.selector).fill(command.value)
      return {
        ok: true,
        id: command.id,
        type: 'fill',
      }
    }
    case 'getAccessibilityTree': {
      const tree = await page.evaluate(() => window.__k6_getAccessibilityTree())
      return {
        ok: true,
        id: command.id,
        type: 'getAccessibilityTree',
        tree,
      }
    }
    default: {
      const exhaustive = command
      return exhaustive
    }
  }
}
function tryParseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return void 0
  }
}
async function driver() {
  const url = __ENV.WS_URL
  if (!url) {
    throw new Error('WS_URL environment variable is required')
  }
  const page = await browser.newPage()
  await page.context().addInitScript(accessibilityScript)
  const ws = new WebSocket(url)
  let queue = Promise.resolve()
  ws.onmessage = (event) => {
    const text = getTextMessage(event?.data)
    if (text === null) {
      return
    }
    const json = tryParseJson(text)
    if (json === void 0) {
      return
    }
    const { data } = DriverCommandSchema.safeParse(json)
    if (data === void 0) {
      return
    }
    queue = queue.then(async () => {
      try {
        const result = await handle(page, data)
        ws.send(JSON.stringify(result))
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        ws.send(
          JSON.stringify({
            id: data.id,
            ok: false,
            type: 'error',
            error: { message },
          })
        )
      }
      return Promise.resolve()
    })
    ws.onclose = () => {
      void page.close()
    }
    ws.onerror = (event2) => {
      console.error('WebSocket error:', event2)
      void page.close()
    }
  }
}

export { driver as default, options }
