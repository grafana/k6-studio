// TODO: modify json_output.py to use CamelCase instead of snake_case
export interface Request {
  headers: Array<Array<string>>
  scheme: string
  host: string
  method: string
  path: string
  content: string
  timestampStart: string
  id?: string
  response?: Response
}

export interface Response {
  headers: Array<Array<string>>
  reason: string
  statusCode: number
  content: string
  path: string
  timestampStart: string
}

export interface ProxyData {
  id: string
  request: Request
  response?: Response
  comment?: string
}
