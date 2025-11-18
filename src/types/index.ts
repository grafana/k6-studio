import { Match } from './fuse'

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

export type KeyValueTuple = [string, string]

export type Header = KeyValueTuple
export type Cookie = KeyValueTuple
export type Query = KeyValueTuple

interface Metadata {
  /**
   * Metadata precomputed for json path rendering.
   * Attached to each request/response to allow co-location, and efficient pre-computations when the data is loaded.
   */
  jsonPaths?: string[]
}

export interface Request extends Metadata {
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

export interface Response extends Metadata {
  headers: Header[]
  cookies: Cookie[]
  reason: string
  statusCode: number
  content: string | null
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

export interface Group {
  id: string
  name: string
  isEditing?: boolean
}

export type GroupedProxyData = Record<string, ProxyData[]>

interface Check {
  description: string
  expression: string
}

export interface RequestSnippetSchema {
  data: ProxyData
  before: string[]
  after: string[]
  checks: Check[]
}

export interface StudioFile {
  type: 'recording' | 'generator' | 'script' | 'data-file'
  displayName: string
  fileName: string
}

export type StudioFileType = StudioFile['type']

export interface FolderContent {
  recordings: Map<string, StudioFile>
  generators: Map<string, StudioFile>
  scripts: Map<string, StudioFile>
  dataFiles: Map<string, StudioFile>
}

export type ProxyStatus = 'online' | 'offline' | 'starting'

export type ProxyDataWithMatches = ProxyData & {
  matches?: Match[]
}
