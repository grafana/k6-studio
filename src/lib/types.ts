// TODO: modify json_output.py to use CamelCase instead of snake_case
export interface Request {
  headers: Array<Array<string>>;
  scheme: string,
  host: string,
  method: string,
  path: string,
  content: string,
  timestamp_start: string,
  id?: string,
  response?: Response
}

export interface Response {
  headers: Array<Array<string>>;
  reason: string,
  status_code: number,
  content: string,
  path: string,
  timestamp_start: string,
}

export interface ProxyData {
  id: string,
  request: Request,
  response?: Response,
}
