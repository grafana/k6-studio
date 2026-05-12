import { expect } from '__K6_TESTING_EXPECT_PATH__';
export * from '__K6_TESTING_EXPECT_PATH__';
import http from 'k6/http';

const TRACKING_SERVER_URL = __ENV.K6_TRACKING_SERVER_PORT ? `http://localhost:${__ENV.K6_TRACKING_SERVER_PORT}` : null;
class TrackingClient {
  name;
  currentId;
  constructor(name) {
    this.name = name;
    this.currentId = 0;
  }
  nextId() {
    return `${this.name}-${this.currentId++}`;
  }
  begin(event) {
    try {
      const body = JSON.stringify(event);
      http.post(`${TRACKING_SERVER_URL}/track/${event.eventId}/begin`, body, {
        headers: { "Content-Type": "application/json" }
      });
    } catch {
      return null;
    }
    return event;
  }
  end(event) {
    try {
      const body = JSON.stringify(event);
      http.post(`${TRACKING_SERVER_URL}/track/${event.eventId}/end`, body, {
        headers: { "Content-Type": "application/json" }
      });
    } catch {
    }
  }
}

function serializeValue(value) {
  if (value === null) {
    return null;
  }
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
      return value;
    case "bigint":
      return Number(value);
    case "symbol":
      return { type: "symbol", value: value.toString() };
    case "function":
      return { type: "function", name: value.name, source: value.toString() };
    case "undefined":
      return { type: "undefined" };
    case "object": {
      if (value instanceof Date) {
        return { type: "date", timestamp: value.getTime() };
      }
      if (value instanceof RegExp) {
        return { type: "regex", pattern: value.source, flags: value.flags };
      }
      if (Symbol.locatorDetail in value) {
        return {
          type: "locator",
          locator: value[Symbol.locatorDetail]
        };
      }
      if (Symbol.pageDetail in value) {
        return { type: "page" };
      }
      if (Array.isArray(value)) {
        return value.map(serializeValue);
      }
      return {
        type: "object",
        value: Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, serializeValue(v)])
        )
      };
    }
    default:
      return { type: "undefined" };
  }
}

const client = new TrackingClient("k6-testing");
const KNOWN_MATCHERS = /* @__PURE__ */ new Set([
  "toBeChecked",
  "toBeDisabled",
  "toBeEditable",
  "toBeEmpty",
  "toBeEnabled",
  "toBeHidden",
  "toBeVisible",
  "toHaveAttribute",
  "toHaveText",
  "toContainText",
  "toHaveTitle",
  "toHaveValue",
  "toBe",
  "toBeCloseTo",
  "toBeGreaterThan",
  "toBeGreaterThanOrEqual",
  "toBeLessThan",
  "toBeLessThanOrEqual",
  "toBeDefined",
  "toBeFalsy",
  "toBeInstanceOf",
  "toBeNaN",
  "toBeNull",
  "toBeTruthy",
  "toBeUndefined",
  "toEqual",
  "toContain",
  "toContainEqual",
  "toHaveLength",
  "toHaveProperty"
]);
function beginAssertion(name, negated, actual, args) {
  if (TRACKING_SERVER_URL === null) {
    return null;
  }
  return client.begin({
    type: "assertion",
    state: "begin",
    eventId: client.nextId(),
    timestamp: { started: Date.now() },
    actual: serializeValue(actual),
    assertion: {
      name,
      matcher: KNOWN_MATCHERS.has(name) ? name : void 0,
      negated,
      args: args.map(serializeValue)
    }
  });
}
function endAssertion(event, result) {
  if (event === null) {
    return;
  }
  client.end({
    ...event,
    state: "end",
    timestamp: {
      ...event.timestamp,
      ended: Date.now()
    },
    result
  });
}

if ("use" in expect && typeof expect.use === "function") {
  expect.use({
    name: "k6-studio-tracking",
    onBegin(context) {
      return beginAssertion(
        context.matcher.name,
        context.negated,
        context.received,
        context.matcher.args
      );
    },
    onEnd(context, state) {
      const result = context.result.state === "pass" ? { type: "pass" } : context.result.state === "fail" ? {
        type: "fail",
        message: context.result.message.custom,
        error: context.result.error
      } : {
        type: "error",
        message: String(context.result.error),
        error: context.result.error
      };
      endAssertion(state, result);
    }
  });
}
