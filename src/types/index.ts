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

export interface Request {
  headers: Array<[string, string]>
  scheme: string
  host: string
  method: Method
  path: string
  content: string
  timestampStart: number
  id?: string
  response?: Response
}

export interface Response {
  headers: Array<[string, string]>
  reason: string
  statusCode: number
  content: string
  path: string
  timestampStart: number
}

export interface ProxyData {
  id: string
  request: Request
  response?: Response
  comment?: string
}

export interface K6Log {
  level: 'info' | 'debug' | 'warning' | 'error'
  msg: string
  source?: string
  time: string
}

export type GroupedProxyData = Record<string, ProxyData[]>
