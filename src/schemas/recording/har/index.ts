import { z } from 'zod'

export const HarHeaderSchema = z.object({
  name: z.string(),
  value: z.string(),
})

const HarCookieSchema = z.object({
  name: z.string(),
  value: z.string(),
})

const HarQueryParamSchema = z.object({
  name: z.string(),
  value: z.string(),
})

const HarPostDataSchema = z.object({
  mimeType: z.string(),
  text: z.string().optional(),
  params: z
    .array(
      z.object({
        name: z.string(),
        value: z.string().optional(),
        fileName: z.string().optional(),
        contentType: z.string().optional(),
      })
    )
    .optional(),
})

export const HarRequestSchema = z
  .object({
    method: z.string(),
    url: z.string(),
    httpVersion: z.string().optional(),
    headers: z.array(HarHeaderSchema).optional(),
    queryString: z.array(HarQueryParamSchema).optional(),
    postData: HarPostDataSchema.optional(),
    cookies: z.array(HarCookieSchema).optional(),
    headersSize: z.number().optional(),
    bodySize: z.number().optional(),
  })
  .passthrough()

export const HarContentSchema = z.object({
  size: z.number().optional(),
  mimeType: z.string().optional(),
  text: z.string().nullable().optional(),
  encoding: z.string().optional(),
})

export const HarResponseSchema = z
  .object({
    status: z.number(),
    statusText: z.string(),
    httpVersion: z.string(),
    headers: z.array(HarHeaderSchema),
    content: HarContentSchema,
    cookies: z.array(HarCookieSchema),
    redirectURL: z.string(),
    headersSize: z.number(),
    bodySize: z.number(),
  })
  .passthrough()

export const HarEntrySchema = z.object({
  pageref: z.string().optional(),
  comment: z.string().optional(),
  startedDateTime: z.string().datetime({ offset: true }).optional(),
  time: z.number().min(0).optional(),
  timings: z.object({}).passthrough().optional(),
  request: HarRequestSchema,
  response: HarResponseSchema.optional(),
  cache: z.object({}).passthrough(),
})

export const HarPageSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    startedDateTime: z.string().datetime({ offset: true }).optional(),
    pageTimings: z.object({}).passthrough().optional(),
  })
  .passthrough()

export const LogSchema = z.object({
  version: z.string(),
  creator: z.object({
    name: z.string(),
    version: z.string(),
  }),
  pages: z.array(HarPageSchema).optional(),
  entries: z.array(HarEntrySchema).optional(),
})
