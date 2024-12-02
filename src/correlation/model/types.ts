import { Variable } from '../types'
import { JsonValue } from '../utils'

export const Source = Symbol('original HAR file')

export type HttpMethod =
  | 'CONNECT'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PUT'
  | 'POST'
  | 'PATCH'
  | 'DELETE'
  | 'TRACE'

/**
 * This is a request/response pair. The name is
 * taken from https://tools.ietf.org/html/rfc2616,
 * where they call it a request/response exchange.
 */

export interface Exchange {
  method: HttpMethod
  url: URL
  request: Request
  response: Response
  started: Date
  ended: Date
  variables: { [name: string]: Variable }
}

export interface Request {
  headers: RequestHeader[]
  body?: RequestBody
}

export interface Response {
  headers: ResponseHeader[]
  body?: ResponseBody
}

export interface ContentType {
  type: 'content-type'

  mimeType: string
  encoding?: string
  raw: RawHeader
  params: { [param: string]: string | boolean }
}

export interface Authorization {
  type: 'authorization'

  authType: string
  credentials: string
  raw: RawHeader
}

export interface RawHeader {
  type: 'raw'

  name: string
  value: string
}

export type RequestHeader = ContentType | Authorization | RawHeader
export type ResponseHeader = ContentType | RawHeader

export type Header = RequestHeader | ResponseHeader

export interface QueryParam {
  name: string
  value?: string
}

export interface MultipartParam {
  name: string
  value?: string
}

export interface MultipartBody {
  type: 'multipart'
  params: MultipartParam[]
}

export interface JsonBody {
  type: 'json'
  data: JsonValue
}

export interface HtmlBody {
  type: 'html'
  document: Document
}

export interface UrlEncodedBody {
  type: 'urlencoded'
  params: QueryParam[]
}

export interface RawBody {
  type: 'raw'
  mimeType: string
  text: string
}

export type RequestBody = JsonBody | UrlEncodedBody | MultipartBody | RawBody
export type ResponseBody =
  | JsonBody
  | HtmlBody
  | UrlEncodedBody
  | MultipartBody
  | RawBody

export type Body = RequestBody | ResponseBody
