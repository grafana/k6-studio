export interface CloudRequest {
  credentials?: CloudCredentials
  signal?: AbortSignal
}

export interface CloudCredentials {
  stackId: string
  token: string
}
