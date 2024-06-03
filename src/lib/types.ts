export interface Request {
  headers: Array<Array<string>>;
  scheme: string,
  host: string,
  method: string,
  path: string,
  content: string,
  timestamp_start: Date,
  id?: string,
  response?: Response
}

export interface Response {
  headers: Array<Array<string>>;
  reason: string,
  status_code: number,
  content: string,
  path: string,
  timestamp_start: Date,
}

export interface ProxyData {
  id: string,
  request: Request,
  response?: Response,
}
