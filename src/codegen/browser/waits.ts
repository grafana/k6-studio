import { getDomain } from 'tldts'

import { BrowserEvent } from '@/schemas/recording'
import { Header, ProxyData } from '@/types'
import { findEntryNavigation, groupEventsByPage } from '@/utils/browserEvents'
import { getContentType } from '@/utils/headers'
import { exhaustive } from '@/utils/typescript'

/** What a replayed action costs; measured at 50-150ms, the low end inserts more (and so safer) waits. */
const ACTION_COST_MS = 100

/** A request that starts later than this after an action is background chatter, not its result. */
const ATTRIBUTION_WINDOW_MS = 3000

/** How long before its value-change event a debounced request may have started. */
const TYPING_LOOKBACK_MS = 10_000

/** Headroom on top of the projected remaining time, for replay running slower than the recording. */
const WAIT_MARGIN_MS = 500

/** Never stall a test for longer than this, however slow the recorded request was. */
const MAX_WAIT_MS = 5000

/** Interactions the simulation replays as their own step. */
type SimulatedInteraction = Extract<
  BrowserEvent,
  {
    type:
      | 'navigate-to-page'
      | 'click'
      | 'input-change'
      | 'check-change'
      | 'radio-change'
      | 'select-change'
      | 'submit-form'
  }
>

interface CandidateRequest {
  startMs: number
  durationMs: number
}

interface AttributedRequest extends CandidateRequest {
  /** Index of the interaction that triggered the request within its tab. */
  triggerIndex: number
  /** How long after that interaction the request started, in the recording. */
  offsetMs: number
}

/**
 * Unlike `isInteraction` in `@/utils/browserEvents`, which answers whether the
 * user acted on the page, this deliberately leaves out asserts, waits and
 * reloads: asserts and `locator.waitFor` retry internally so they never lose a
 * race, and a reload starts a fresh document the way a navigation does.
 * Leaving them off the timeline only makes the simulated replay faster than
 * the real one, which errs toward more waits.
 */
function isSimulatedInteraction(
  event: BrowserEvent
): event is SimulatedInteraction {
  switch (event.type) {
    case 'click':
    case 'input-change':
    case 'check-change':
    case 'radio-change':
    case 'select-change':
    case 'submit-form':
      return true

    // Implicit navigations are the side effect of another action, so they are
    // not replayed and cannot trigger anything of their own.
    case 'navigate-to-page':
      return event.source !== 'implicit'

    case 'tab-opened':
    case 'reload-page':
    case 'assert':
    case 'wait-for':
      return false

    default:
      return exhaustive(event)
  }
}

function isValueInput(interaction: SimulatedInteraction): boolean {
  return (
    interaction.type === 'input-change' ||
    interaction.type === 'select-change' ||
    interaction.type === 'check-change' ||
    interaction.type === 'radio-change'
  )
}

/**
 * The journey's origin, taken from the first navigation that can be replayed as
 * a `page.goto`. Recordings can open on browser-internal pages (a new tab
 * page), whose host would match nothing.
 */
function getOriginHost(events: BrowserEvent[]): string | null {
  const entry = findEntryNavigation(events)?.entry

  return entry === undefined ? null : new URL(entry.url).hostname
}

// Conversion from HAR drops the entry's mime type, so the response headers are
// the only place left to tell a data fetch from a document or an asset.
function isJsonResponse(headers: Header[]): boolean {
  return getContentType(headers)?.toLowerCase().includes('json') ?? false
}

/**
 * Requests that a following action could plausibly depend on: data fetches the
 * page made against its own site. Cross-site requests (analytics, embeds) and
 * documents or assets do not carry state the next action reads back.
 */
function getCandidateRequests(
  requests: ProxyData[],
  originHost: string
): CandidateRequest[] {
  const originDomain = getDomain(originHost)

  // Hosts without a public suffix (localhost, raw IPs) have no registrable
  // domain to group by, so they only match themselves.
  const isSameSite = (requestHost: string) =>
    originDomain === null
      ? requestHost === originHost
      : getDomain(requestHost) === originDomain

  return requests.flatMap(({ request, response }) => {
    const { timestampStart, timestampEnd, host } = request

    // Timestamps are seconds here, and the HAR round-trip encodes the entry's
    // duration as the request end. Without a response, or without a usable end,
    // there is no duration to project onto the replay timeline.
    if (response === undefined || timestampEnd <= timestampStart) {
      return []
    }

    if (!isJsonResponse(response.headers) || !isSameSite(host)) {
      return []
    }

    return [
      {
        startMs: timestampStart * 1000,
        durationMs: (timestampEnd - timestampStart) * 1000,
      },
    ]
  })
}

function attributeRequest(
  interactions: SimulatedInteraction[],
  candidate: CandidateRequest
): AttributedRequest | null {
  // Sites fire debounced fetches while the user is still typing, before the
  // recorder's value-change event lands. On replay `fill()` collapses the
  // typing into one shot, so the request goes out at the interaction itself,
  // hence offset 0.
  const typedIndex = interactions.findIndex(
    (interaction) =>
      isValueInput(interaction) &&
      interaction.timestamp >= candidate.startMs &&
      interaction.timestamp - candidate.startMs <= TYPING_LOOKBACK_MS
  )

  if (typedIndex !== -1) {
    return { ...candidate, triggerIndex: typedIndex, offsetMs: 0 }
  }

  const precedingIndex = interactions.findLastIndex(
    (interaction) => interaction.timestamp <= candidate.startMs
  )
  const preceding = interactions[precedingIndex]

  if (preceding === undefined) {
    return null
  }

  const offsetMs = candidate.startMs - preceding.timestamp

  return offsetMs > ATTRIBUTION_WINDOW_MS
    ? null
    : { ...candidate, triggerIndex: precedingIndex, offsetMs }
}

/**
 * Replays a tab's interactions on a virtual clock, back-to-back the way the
 * generated test will run them, and reports where a recorded request would
 * still be in flight.
 */
function simulateTab(
  interactions: SimulatedInteraction[],
  attributed: AttributedRequest[]
): Array<[eventId: string, timeout: number]> {
  const insertions: Array<[string, number]> = []
  const replayTimes: number[] = []
  let clock = 0

  for (const [index, interaction] of interactions.entries()) {
    let longestRemainingMs = 0

    for (const request of attributed) {
      const triggerTime = replayTimes[request.triggerIndex]

      // An unset slot means the trigger has not replayed yet (it is this
      // interaction or a later one), so the request cannot be in flight.
      if (triggerTime === undefined) {
        continue
      }

      const finishTime = triggerTime + request.offsetMs + request.durationMs

      if (finishTime <= clock) {
        continue
      }

      // The recording only proves this interaction depends on the request if the
      // user's own pacing waited it out first. Requests that were never finished
      // before an interaction (long polling, streaming, open channels) cannot be
      // raced by it, and without this check they would insert waits everywhere.
      if (request.startMs + request.durationMs > interaction.timestamp) {
        continue
      }

      longestRemainingMs = Math.max(longestRemainingMs, finishTime - clock)
    }

    // A `goto` starts a fresh document, so nothing left over from the old page
    // can race it. Navigations still trigger requests and take up time on the
    // timeline, they just never need a wait in front of them.
    if (longestRemainingMs > 0 && interaction.type !== 'navigate-to-page') {
      const timeout = Math.min(
        Math.ceil(longestRemainingMs * 2 + WAIT_MARGIN_MS),
        MAX_WAIT_MS
      )

      insertions.push([interaction.eventId, timeout])
      clock += timeout
    }

    replayTimes[index] = clock
    clock += ACTION_COST_MS
  }

  return insertions
}

/**
 * Detects where a recorded journey needs `page.waitForTimeout` actions when
 * replayed at machine speed: requests that the user's pacing waited out at
 * record time, but that would still be in flight when the dependent action
 * runs in the replay timeline. Keyed by the id of the event each wait must
 * precede.
 */
export function detectWaits(
  events: BrowserEvent[],
  requests: ProxyData[]
): Map<string, number> {
  const originHost = getOriginHost(events)

  if (originHost === null) {
    return new Map()
  }

  const candidates = getCandidateRequests(requests, originHost)

  // Requests carry no tab association, so every candidate is offered to every
  // tab and may end up attributed in more than one of them. That is safe: the
  // attribution windows and the completed-before condition in the simulation
  // bound how much noise a request can cause in a tab it does not belong to.
  return new Map(
    groupEventsByPage(events).flatMap((page) => {
      const interactions = page.events.filter(isSimulatedInteraction)
      const attributed = candidates.flatMap(
        (candidate) => attributeRequest(interactions, candidate) ?? []
      )

      return simulateTab(interactions, attributed)
    })
  )
}
