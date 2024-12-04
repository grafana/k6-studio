import { SearchMatch } from './fuse'

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

export interface K6Check {
  id: string
  name: string
  path: string
  passes: number
  fails: number
}

export interface Group {
  id: string
  name: string
  isEditing?: boolean
}

export type GroupedProxyData = Record<string, ProxyData[]>

export interface RequestSnippetSchema {
  data: ProxyData
  before: string[]
  after: string[]
}

export interface StudioFile {
  type: 'recording' | 'generator' | 'script'
  displayName: string
  fileName: string
  viewPath: string
}

export type StudioFileType = StudioFile['type']

export interface FolderContent {
  recordings: Map<string, StudioFile>
  generators: Map<string, StudioFile>
  scripts: Map<string, StudioFile>
}

export type ProxyStatus = 'online' | 'offline' | 'restarting'

export interface ProxyDataWithMatches extends ProxyData {
  matches?: SearchMatch[]
}
