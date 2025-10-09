import { Protocol as CDP } from 'devtools-protocol'
import { z } from 'zod'

const ChromeEventSchema = z.object({
  method: z.string(),
  params: z.record(z.unknown()),
})

const ChromeResponseSchema = z.object({
  id: z.number(),
  result: z.record(z.unknown()),
})

const ChromeErrorSchema = z.object({
  id: z.number(),
  error: z.record(z.unknown()),
})

export const ChromeMessageSchema = z.union([
  ChromeResponseSchema,
  ChromeEventSchema,
  ChromeErrorSchema,
])

export interface ChromeEventMap {
  // Page
  'Page.frameNavigated': CDP.Page.FrameNavigatedEvent

  // Target
  'Target.attachedToTarget': CDP.Target.AttachedToTargetEvent
}

export type ChromeEvent = {
  [K in keyof ChromeEventMap]: {
    method: K
    params: ChromeEventMap[K]
  }
}[keyof ChromeEventMap]

export interface ChromeRequestMap {
  // Extensions
  'Extensions.loadUnpacked': {
    request: CDP.Extensions.LoadUnpackedRequest
    response: CDP.Extensions.LoadUnpackedResponse
  }

  // Page
  'Page.addScriptToEvaluateOnNewDocument': {
    request: CDP.Page.AddScriptToEvaluateOnNewDocumentRequest
    response: CDP.Page.AddScriptToEvaluateOnNewDocumentResponse
  }
  'Page.enable': {
    request: CDP.Page.EnableRequest
    response: EmptyObject
  }

  // Target
  'Target.setAutoAttach': {
    request: CDP.Target.SetAutoAttachRequest
    response: EmptyObject
  }
}

export type ChromeRequest<K extends keyof ChromeRequestMap> = {
  method: K
  params: ChromeRequestMap[K]['request']
}

export type ChromeResponse<K extends keyof ChromeRequestMap> =
  ChromeRequestMap[K]['response']
