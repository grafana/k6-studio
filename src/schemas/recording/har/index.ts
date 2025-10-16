import type { Content, Entry, Page, Response, Request } from 'har-format'
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

const HarPostDataSchema = z.intersection(
  z.object({
    mimeType: z.string(),
  }),
  z.union([
    z.object({ text: z.string() }),
    z.object({
      params: z.array(
        z.object({
          name: z.string(),
          value: z.string().optional(),
          fileName: z.string().optional(),
          contentType: z.string().optional(),
        })
      ),
    }),
  ])
)

export const HarRequestSchema: z.ZodType<Request> = z
  .object({
    method: z.string(),
    url: z.string(),
    httpVersion: z.string(),
    headers: z.array(HarHeaderSchema),
    queryString: z.array(HarQueryParamSchema),
    postData: HarPostDataSchema.optional(),
    cookies: z.array(HarCookieSchema),
    headersSize: z.number(),
    bodySize: z.number(),
  })
  .passthrough()

// Despite `ProxyData` definition, `text` in the response content can be `null`
// Additionally, `content` could be an empty object
type OptionalContentWithNullableText = Partial<Omit<Content, 'text'>> & {
  text?: string | null
}

export const HarContentSchema: z.ZodType<OptionalContentWithNullableText> =
  z.object({
    size: z.number().optional(),
    mimeType: z.string().optional(),
    text: z.string().nullable().optional(),
    encoding: z.string().optional(),
  })

type ResponseWithNullableContent = Omit<Response, 'content'> & {
  content: OptionalContentWithNullableText
}

export const HarResponseSchema: z.ZodType<ResponseWithNullableContent> = z
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

export const HarEntrySchema: z.ZodType<
  Omit<Entry, 'response' | 'timings'> & {
    response?: ResponseWithNullableContent
  }
> = z.object({
  pageref: z.string().optional(),
  startedDateTime: z.string().datetime({ offset: true }),
  time: z.number().min(0),
  timings: z.object({}).passthrough(),
  request: HarRequestSchema,
  response: HarResponseSchema.optional(),
  cache: z.object({}).passthrough(),
})

export const HarPageSchema: z.ZodType<Page> = z
  .object({
    id: z.string(),
    title: z.string(),
    startedDateTime: z.string().datetime({ offset: true }),
    pageTimings: z.object({}).passthrough(),
  })
  .passthrough()

export const LogSchema = z.object({
  version: z.string(),
  creator: z.object({
    name: z.string(),
    version: z.string(),
  }),
  pages: z.array(HarPageSchema),
  entries: z.array(HarEntrySchema),
})
