import http from 'k6/http'
import execution from 'k6/execution'
import { browser } from 'k6/browser'
import * as userScript from '__USER_SCRIPT_PATH__'

function instrumentParams(params) {
  const safeParams = params ?? {}
  const group = `${execution.vu.metrics.tags.group}`.trim().replace(/^::/, '')
  const groupHeaders = {
    'X-k6-group': group,
  }
  const updatedParams = Object.assign({}, safeParams, {
    headers: Object.assign({}, safeParams.headers || {}, groupHeaders),
  })
  return updatedParams
}

const originalRequest = http.request
const originalAsyncRequest = http.asyncRequest
http.request = function (method, url, body, params) {
  return originalRequest(method, url, body, instrumentParams(params))
}
http.asyncRequest = function (method, url, body, params) {
  return originalAsyncRequest(method, url, body, instrumentParams(params))
}
http.get = function (url, params) {
  return http.request('GET', url, null, instrumentParams(params))
}
http.head = function (url, params) {
  return http.request('HEAD', url, null, instrumentParams(params))
}
http.post = function (url, body, params) {
  return http.request('POST', url, body, instrumentParams(params))
}
http.put = function (url, body, params) {
  return http.request('PUT', url, body, instrumentParams(params))
}
http.patch = function (url, body, params) {
  return http.request('PATCH', url, body, instrumentParams(params))
}
http.del = function (url, body, params) {
  return http.request('DELETE', url, body, instrumentParams(params))
}
http.options = function (url, body, params) {
  return http.request('OPTIONS', url, body, instrumentParams(params))
}

const TRACKING_SERVER_URL = __ENV.K6_TRACKING_SERVER_PORT
  ? `http://localhost:${__ENV.K6_TRACKING_SERVER_PORT}`
  : null
const nextId = /* @__PURE__ */ (() => {
  let currentId = 0
  return () => {
    return String(currentId++)
  }
})()
function begin(action) {
  if (TRACKING_SERVER_URL === null) {
    return null
  }
  if (action === void 0) {
    return null
  }
  const event = {
    eventId: nextId(),
    timestamp: Date.now(),
    action,
  }
  try {
    const body = JSON.stringify(event)
    http.post(`${TRACKING_SERVER_URL}/track/${event.eventId}/begin`, body, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return null
  }
  return event
}
function end(event, result) {
  if (event === null) {
    return
  }
  try {
    const body = {
      ...event,
      timestamp: Date.now(),
      result,
    }
    http.post(
      `${TRACKING_SERVER_URL}/track/${event.eventId}/end`,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch {}
}
function createProxy(target, proxies) {
  return new Proxy(target, {
    get(target2, property) {
      const original = target2[property]
      if (typeof original !== 'function' || property in proxies === false) {
        return original
      }
      const { track, proxy } = proxies[property] ?? {}
      return function (...args) {
        const action = track?.(...args)
        const eventId = begin(action)
        const handleSuccess = (result) => {
          end(eventId, {
            type: 'success',
            returnValue: result,
          })
          if (typeof result !== 'object' || result === null) {
            return result
          }
          if (proxy !== void 0) {
            return createProxy(result, proxy(result, ...args))
          }
          return result
        }
        const handleError = (error) => {
          end(eventId, {
            type: 'error',
            error: String(error),
          })
          throw error
        }
        try {
          const result = original(...args)
          if (result instanceof Promise) {
            return result.then(handleSuccess).catch(handleError)
          }
          return handleSuccess(result)
        } catch (error) {
          handleError(error)
        }
      }
    },
  })
}

const locatorProxy = (_target, selector) => {
  return {
    click: {
      track: () => {
        return {
          type: 'click',
          selector,
        }
      },
    },
  }
}
createProxy(browser, {
  newPage: {
    proxy: (_target) => {
      console.log('Shimmed!')
      return {
        goto: {
          track(url) {
            return {
              type: 'goto',
              url,
            }
          },
        },
        locator: {
          proxy: locatorProxy,
        },
      }
    },
  },
})

function handleSummary(data) {
  const checks = []
  function traverseGroup(group) {
    if (group.checks) {
      group.checks.forEach((check) => {
        checks.push(check)
      })
    }
    if (group.groups) {
      group.groups.forEach((subGroup) => {
        traverseGroup(subGroup)
      })
    }
  }
  traverseGroup(data.root_group)
  return {
    stdout: JSON.stringify(checks),
  }
}

const DEFAULT_SCENARIOS = {
  default: {
    executor: 'per-vu-iterations',
    exec: 'default',
  },
}
const scenarios = Object.fromEntries(
  Object.entries(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    userScript.options?.scenarios ?? DEFAULT_SCENARIOS
  ).map(([name, scenario]) => {
    return [
      name,
      {
        // Always use 1 VU, 1 iteration in the debugger
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 1,
        exec: scenario.exec ?? 'default',
        // Make sure the browser options are carried over
        options: scenario.options,
      },
    ]
  })
)
const options = {
  scenarios,
}
async function entrypoint() {
  const exec = Object.values(scenarios).find(
    ({ exec: exec2 }) => exec2 === 'default'
  )
    ? 'default'
    : Object.values(scenarios)[0]?.exec
  if (exec === void 0) {
    throw new Error('No scenario found to execute')
  }
  await userScript[exec]()
}

export { entrypoint as default, handleSummary, options }
