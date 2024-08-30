// TODO: modify json_output.py to use CamelCase instead of snake_case
export type Method =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD'
  | 'CONNECT'
  | 'TRACE'

type KeyValueTuple = [string, string]

export type Header = KeyValueTuple
export type Cookie = KeyValueTuple
export type Query = KeyValueTuple

export interface Request {
  headers: Header[]
  cookies: Cookie[]
  query: Query[]
  scheme: string
  host: string
  method: Method
  path: string
  content: string | null
  contentHash: string
  timestampStart: number
  timestampEnd: number
  id?: string
  response?: Response
  contentLength: number
  httpVersion: string
  url: string
}

export interface Response {
  headers: Header[]
  cookies: Cookie[]
  reason: string
  statusCode: number
  content: string
  contentHash: string
  path: string
  timestampStart: number
  httpVersion: string
  contentLength: number
}

export interface ProxyData {
  id: string
  request: Request
  response?: Response
  comment?: string
  group?: string
}

export type ProxyDataWithResponse = ProxyData & { response: Response }

export interface K6Log {
  level: 'info' | 'debug' | 'warning' | 'error'
  msg: string
  source?: string
  time: string
  error?: string
}

export type GroupedProxyData = Record<string, ProxyData[]>

export interface RequestSnippetSchema {
  data: ProxyData
  before: string[]
  after: string[]
}

export interface FolderContent {
  recordings: string[]
  generators: string[]
  scripts: string[]
}
